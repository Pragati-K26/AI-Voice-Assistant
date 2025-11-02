"""
Speech-to-Text service using Whisper
"""
import tempfile
import os
from typing import Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

try:
    import whisper
    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    logger.warning("Whisper not available. Install with: pip install openai-whisper")

class SpeechToTextService:
    """Service for converting speech to text using Whisper"""
    
    def __init__(self):
        self.model = None
        self.model_name = settings.WHISPER_MODEL
    
    def load_model(self):
        """Load Whisper model"""
        if not WHISPER_AVAILABLE:
            logger.warning("Whisper not installed. Text input will be used directly.")
            return
        if self.model is None:
            logger.info(f"Loading Whisper model: {self.model_name}")
            self.model = whisper.load_model(self.model_name)
            logger.info("Whisper model loaded successfully")
    
    def transcribe(self, audio_file_path: str, language: Optional[str] = None) -> dict:
        """
        Transcribe audio file to text
        
        Args:
            audio_file_path: Path to audio file
            language: Optional language code (e.g., 'en', 'hi')
        
        Returns:
            Dictionary with 'text' and 'language' keys
        """
        if not WHISPER_AVAILABLE:
            raise Exception("Whisper not installed. Please use text input or install: pip install openai-whisper")
        
        if self.model is None:
            self.load_model()
        
        try:
            # Transcribe audio
            result = self.model.transcribe(
                audio_file_path,
                language=language,
                task="transcribe"
            )
            
            return {
                "text": result["text"].strip(),
                "language": result.get("language", language or "en"),
                "segments": result.get("segments", [])
            }
        except Exception as e:
            logger.error(f"Error transcribing audio: {str(e)}")
            raise Exception(f"Transcription failed: {str(e)}")
    
    def transcribe_bytes(self, audio_bytes: bytes, language: Optional[str] = None) -> dict:
        """
        Transcribe audio bytes to text
        
        Args:
            audio_bytes: Audio file bytes
            language: Optional language code
        
        Returns:
            Dictionary with transcription results
        """
        # Save to temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            tmp_file.write(audio_bytes)
            tmp_file_path = tmp_file.name
        
        try:
            result = self.transcribe(tmp_file_path, language)
            return result
        finally:
            # Clean up temporary file
            if os.path.exists(tmp_file_path):
                os.remove(tmp_file_path)


# Global instance
stt_service = SpeechToTextService()

