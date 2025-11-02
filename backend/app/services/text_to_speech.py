"""
Text-to-Speech service
"""
import tempfile
import os
from typing import Optional
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

try:
    from gtts import gTTS
    import io
    GTTS_AVAILABLE = True
except ImportError:
    GTTS_AVAILABLE = False
    logger.warning("gTTS not available")

try:
    import pyttsx3
    PYTTSX3_AVAILABLE = True
except ImportError:
    PYTTSX3_AVAILABLE = False
    logger.warning("pyttsx3 not available")


class TextToSpeechService:
    """Service for converting text to speech"""
    
    def __init__(self):
        self.engine = settings.TTS_ENGINE
        self.language = settings.TTS_LANGUAGE
        self._pyttsx3_engine = None
        
        if self.engine == "pyttsx3" and PYTTSX3_AVAILABLE:
            try:
                self._pyttsx3_engine = pyttsx3.init()
            except Exception as e:
                logger.warning(f"Could not initialize pyttsx3: {str(e)}")
    
    def synthesize(self, text: str, language: Optional[str] = None) -> bytes:
        """
        Convert text to speech audio
        
        Args:
            text: Text to convert
            language: Optional language code (defaults to config)
        
        Returns:
            Audio bytes (MP3 format)
        """
        lang = language or self.language
        
        if self.engine == "gtts" and GTTS_AVAILABLE:
            return self._synthesize_gtts(text, lang)
        elif self.engine == "pyttsx3" and PYTTSX3_AVAILABLE:
            return self._synthesize_pyttsx3(text)
        else:
            # Fallback: return empty bytes or raise error
            logger.error("No TTS engine available")
            raise Exception("Text-to-speech not available")
    
    def _synthesize_gtts(self, text: str, language: str) -> bytes:
        """Synthesize using gTTS"""
        try:
            tts = gTTS(text=text, lang=language, slow=False)
            audio_buffer = io.BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            return audio_buffer.read()
        except Exception as e:
            logger.error(f"gTTS synthesis failed: {str(e)}")
            raise
    
    def _synthesize_pyttsx3(self, text: str) -> bytes:
        """Synthesize using pyttsx3"""
        if not self._pyttsx3_engine:
            raise Exception("pyttsx3 engine not initialized")
        
        try:
            # Save to temporary file
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
                tmp_file_path = tmp_file.name
            
            self._pyttsx3_engine.save_to_file(text, tmp_file_path)
            self._pyttsx3_engine.runAndWait()
            
            with open(tmp_file_path, "rb") as f:
                audio_bytes = f.read()
            
            os.remove(tmp_file_path)
            return audio_bytes
        except Exception as e:
            logger.error(f"pyttsx3 synthesis failed: {str(e)}")
            raise


# Global instance
tts_service = TextToSpeechService()

