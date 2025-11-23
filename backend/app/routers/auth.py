"""Authentication router"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import timedelta

from app.core.database import get_db
from app.core.config import settings
from app.services.auth_service import auth_service
from app.models.user import User

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

class Token(BaseModel):
    access_token: str
    token_type: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    account_number: str
    balance: float

    class Config:
        from_attributes = True

class VoicePinRequest(BaseModel):
    voice_pin: str

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Get current authenticated user – demo fallback works."""
    payload = auth_service.verify_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )
    user_id = payload.get("sub")
    # Demo user has id 0
    if user_id == "0" or user_id == 0:
        class DemoUser:
            id = 0
            username = "demo_user"
            email = "demo@example.com"
            account_number = "DEMO12345"
            balance = 0.0
        return DemoUser()  # type: ignore
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Login endpoint – accepts demo credentials."""
    user = None
    
    # Normalize username (strip whitespace, handle case if needed)
    username = form_data.username.strip() if form_data.username else ""
    password = form_data.password if form_data.password else ""
    
    # First, try hardcoded demo credentials (always works)
    if username == "demo_user" and password == "demo123":
        class DemoUser:
            id = 0
        user = DemoUser()
    else:
        # Try to authenticate against database
        user = auth_service.authenticate_user(db, username, password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth_service.create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/verify-voice-pin")
async def verify_voice_pin(
    request: VoicePinRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Verify voice PIN."""
    is_valid = auth_service.verify_voice_pin(db, current_user.id, request.voice_pin)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid voice PIN"
        )
    return {"verified": True}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return current_user

@router.post("/generate-otp")
async def generate_otp(current_user: User = Depends(get_current_user)):
    """Generate OTP for sensitive operations."""
    otp = auth_service.generate_otp(current_user.id)
    return {"message": "OTP sent to your registered mobile number", "otp": otp}
