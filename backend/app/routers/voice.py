"""
Voice processing router
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid
import logging
import base64

from app.core.database import get_db
from app.routers.auth import get_current_user
from app.models.user import User
from app.services.speech_to_text import stt_service
from app.services.intent_recognition import intent_service
from app.services.dialogue_manager import dialogue_manager
from app.services.text_to_speech import tts_service
from app.services.banking_service import banking_service
from app.services.spending_tracker import spending_tracker
from app.services.fraud_detector import fraud_detector
from app.services.notification_service import notification_service

router = APIRouter()
logger = logging.getLogger(__name__)


class VoiceRequest(BaseModel):
    text: str
    session_id: Optional[str] = None
    language: Optional[str] = None


class VoiceResponse(BaseModel):
    transcript: str
    intent: str
    confidence: float
    entities: dict
    response_text: str
    response_audio_url: Optional[str] = None
    action: Optional[dict] = None
    session_id: str


@router.post("/transcribe")
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Transcribe audio to text"""
    try:
        audio_bytes = await audio.read()
        result = stt_service.transcribe_bytes(audio_bytes, language)
        return result
    except Exception as e:
        logger.error(f"Transcription error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")


@router.post("/process", response_model=VoiceResponse)
async def process_voice_request(
    request: VoiceRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Process voice request: transcribe -> intent -> dialogue -> action
    """
    session_id = request.session_id or str(uuid.uuid4())
    user_text = request.text
    
    # Step 1: Intent recognition
    intent, confidence, entities = intent_service.recognize_intent(user_text)
    
    # Step 2: Get user balance for context
    balance = banking_service.get_balance(db, current_user.id)
    
    # Step 3: Dialogue management
    response_text, action_data = dialogue_manager.process_intent(
        user_id=current_user.id,
        session_id=session_id,
        user_text=user_text,
        intent=intent,
        entities=entities,
        user_balance=balance
    )
    
    # Step 4: Execute actions that don't require OTP
    if action_data:
        action = action_data.get("action")
        if action == "spending_summary":
            try:
                period = action_data.get("period", "month")
                summary = spending_tracker.get_spending_summary(db, current_user.id, period)
                # Enhance response with actual data
                if summary.get("total_spending"):
                    response_text = (
                        f"Your spending summary for the last {period}: "
                        f"Total spending: ₹{summary['total_spending']:,.2f}, "
                        f"Total income: ₹{summary['total_income']:,.2f}, "
                        f"Savings: ₹{summary['savings']:,.2f}. "
                        f"Top spending category: {summary.get('top_category', 'N/A')}."
                    )
            except Exception as e:
                logger.error(f"Error getting spending summary: {str(e)}")
        
        elif action == "category_spending":
            try:
                category = action_data.get("category", "all")
                period = action_data.get("period", "month")
                spending = spending_tracker.get_category_spending(db, current_user.id, category, period)
                if spending.get("amount"):
                    response_text = (
                        f"You spent ₹{spending['amount']:,.2f} on {category} "
                        f"in the last {period}."
                    )
            except Exception as e:
                logger.error(f"Error getting category spending: {str(e)}")
        
        elif action == "view_notifications":
            try:
                notifications = notification_service.get_user_notifications(db, current_user.id)
                if notifications:
                    response_text = f"You have {len(notifications)} notifications. " + ". ".join([
                        n.get("message", "") for n in notifications[:3]
                    ])
                else:
                    response_text = "You have no new notifications."
            except Exception as e:
                logger.error(f"Error getting notifications: {str(e)}")
    
    # Step 4: Generate audio response (optional)
    # In a real implementation, you might want to store audio and return URL
    
    return VoiceResponse(
        transcript=user_text,
        intent=intent,
        confidence=confidence,
        entities=entities,
        response_text=response_text,
        response_audio_url=None,
        action=action_data,
        session_id=session_id
    )


@router.post("/synthesize")
async def synthesize_speech(
    text: str,
    language: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Convert text to speech"""
    try:
        audio_bytes = tts_service.synthesize(text, language)
        # In production, save to storage and return URL
        # For now, return base64 encoded audio
        import base64
        audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
        return {
            "audio_base64": audio_base64,
            "format": "mp3"
        }
    except Exception as e:
        logger.error(f"TTS error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"TTS failed: {str(e)}")


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time voice interaction"""
    await websocket.accept()
    session_id = None
    current_user = None
    
    try:
        # Receive authentication token
        data = await websocket.receive_json()
        token = data.get("token")
        
        if not token:
            await websocket.close(code=1008, reason="Authentication required")
            return
        
        # Verify token and get user (simplified - in production use proper dependency)
        from app.services.auth_service import auth_service
        payload = auth_service.verify_token(token)
        if not payload:
            await websocket.close(code=1008, reason="Invalid token")
            return
        
        user_id = int(payload.get("sub"))
        current_user = db.query(User).filter(User.id == user_id).first()
        if not current_user:
            await websocket.close(code=1008, reason="User not found")
            return
        
        session_id = str(uuid.uuid4())
        await websocket.send_json({
            "type": "connected",
            "session_id": session_id,
            "message": "Voice assistant ready"
        })
        
        while True:
            # Receive audio or text
            data = await websocket.receive_json()
            
            if data.get("type") == "audio":
                # Process audio
                audio_base64 = data.get("audio")
                audio_bytes = base64.b64decode(audio_base64)
                
                # Transcribe
                transcription = stt_service.transcribe_bytes(audio_bytes)
                user_text = transcription["text"]
            elif data.get("type") == "text":
                user_text = data.get("text", "")
            else:
                continue
            
            # Process request
            balance = banking_service.get_balance(db, current_user.id)
            intent, confidence, entities = intent_service.recognize_intent(user_text)
            response_text, action_data = dialogue_manager.process_intent(
                user_id=current_user.id,
                session_id=session_id,
                user_text=user_text,
                intent=intent,
                entities=entities,
                user_balance=balance
            )
            
            # Generate audio response
            try:
                audio_bytes = tts_service.synthesize(response_text)
                audio_base64 = base64.b64encode(audio_bytes).decode('utf-8')
            except:
                audio_base64 = None
            
            # Send response
            await websocket.send_json({
                "type": "response",
                "transcript": user_text,
                "intent": intent,
                "confidence": confidence,
                "response_text": response_text,
                "response_audio": audio_base64,
                "action": action_data
            })
            
            # Execute action if needed
            if action_data and action_data.get("action") == "transfer_funds" and action_data.get("otp"):
                try:
                    # Check for fraud before transfer
                    fraud_alerts = fraud_detector.detect_fraud(
                        db, current_user.id, action_data["amount"], action_data.get("recipient_name")
                    )
                    if fraud_alerts:
                        await websocket.send_json({
                            "type": "fraud_alert",
                            "alerts": fraud_alerts,
                            "requires_confirmation": True
                        })
                    
                    result = banking_service.transfer_funds(
                        db=db,
                        user_id=current_user.id,
                        amount=action_data["amount"],
                        recipient_name=action_data["recipient_name"],
                        otp=action_data["otp"]
                    )
                    await websocket.send_json({
                        "type": "action_result",
                        "success": True,
                        "data": result
                    })
                except Exception as e:
                    await websocket.send_json({
                        "type": "action_result",
                        "success": False,
                        "error": str(e)
                    })
            
            # Handle spending summary action
            elif action_data and action_data.get("action") == "spending_summary":
                try:
                    period = action_data.get("period", "month")
                    summary = spending_tracker.get_spending_summary(db, current_user.id, period)
                    await websocket.send_json({
                        "type": "spending_summary",
                        "data": summary
                    })
                except Exception as e:
                    logger.error(f"Error getting spending summary: {str(e)}")
            
            # Handle category spending action
            elif action_data and action_data.get("action") == "category_spending":
                try:
                    category = action_data.get("category", "all")
                    period = action_data.get("period", "month")
                    spending = spending_tracker.get_category_spending(db, current_user.id, category, period)
                    await websocket.send_json({
                        "type": "category_spending",
                        "data": spending
                    })
                except Exception as e:
                    logger.error(f"Error getting category spending: {str(e)}")
            
            # Handle notifications action
            elif action_data and action_data.get("action") == "view_notifications":
                try:
                    notifications = notification_service.get_user_notifications(db, current_user.id)
                    await websocket.send_json({
                        "type": "notifications",
                        "data": notifications
                    })
                except Exception as e:
                    logger.error(f"Error getting notifications: {str(e)}")
    
    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        try:
            await websocket.send_json({
                "type": "error",
                "message": str(e)
            })
        except:
            pass

