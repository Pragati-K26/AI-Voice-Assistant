"""
Authentication service
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.models.user import User
from app.core.config import settings
import pyotp
import logging

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Authentication and authorization service"""
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hash password"""
        # Bcrypt has a 72 byte limit, truncate if necessary
        if len(password.encode('utf-8')) > 72:
            password = password[:72]
        return pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode,
            settings.JWT_SECRET_KEY,
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[dict]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(
                token,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            return payload
        except JWTError:
            return None
    
    def authenticate_user(self, db: Session, username: str, password: str) -> Optional[User]:
        """Authenticate user with username and password"""
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return None
        if not self.verify_password(password, user.hashed_password):
            return None
        return user
    
    def verify_voice_pin(self, db: Session, user_id: int, voice_pin: str) -> bool:
        """Verify voice PIN (mock implementation)"""
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.voice_pin_hash:
            return False
        return self.verify_password(voice_pin, user.voice_pin_hash)
    
    def generate_otp(self, user_id: int) -> str:
        """
        Generate OTP for user
        In production, send via SMS/email
        """
        # For demo: generate a 6-digit OTP
        totp = pyotp.TOTP(pyotp.random_base32())
        otp = totp.now()
        logger.info(f"Generated OTP for user {user_id}: {otp}")  # In production, send via SMS
        return otp
    
    def verify_otp(self, user_id: int, otp: str) -> bool:
        """
        Verify OTP (mock implementation)
        In production, verify against sent OTP with expiry
        """
        # For demo: accept any 4-6 digit OTP
        if len(otp) >= 4 and otp.isdigit():
            return True
        return False


# Global instance
auth_service = AuthService()

