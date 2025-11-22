"""
Application configuration
"""
from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Union
import json


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "AI Voice Banking Assistant"
    DEBUG: bool = False
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # CORS - can be JSON array or comma-separated string
    ALLOWED_ORIGINS: Union[List[str], str] = "*"
    
    # Database
    DATABASE_URL: str = "sqlite:///./banking_assistant.db"
    
    # JWT
    JWT_SECRET_KEY: str = "your-jwt-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Voice Processing
    WHISPER_MODEL: str = "base"  # tiny, base, small, medium, large
    MAX_AUDIO_DURATION: int = 60  # seconds
    SUPPORTED_AUDIO_FORMATS: List[str] = ["wav", "mp3", "m4a", "ogg"]
    
    # NLU
    INTENT_MODEL_PATH: str = "models/intent_model"
    CONFIDENCE_THRESHOLD: float = 0.7
    
    # TTS
    TTS_ENGINE: str = "gtts"  # gtts, pyttsx3, coqui
    TTS_LANGUAGE: str = "en"
    
    # Authentication
    OTP_EXPIRY_MINUTES: int = 5
    VOICE_PIN_ENABLED: bool = True
    
    # Gemini API
    GEMINI_API_KEY: str = ""
    
    # Google Cloud
    GCP_PROJECT_ID: str = ""
    GCP_BUCKET_NAME: str = ""
    
    @field_validator('ALLOWED_ORIGINS', mode='before')
    @classmethod
    def parse_origins(cls, v):
        """Parse ALLOWED_ORIGINS from various formats"""
        if isinstance(v, str):
            # Handle "*" for all origins
            if v == "*":
                return ["*"]
            # Try to parse as JSON first
            try:
                parsed = json.loads(v)
                if isinstance(parsed, list):
                    return parsed
            except (json.JSONDecodeError, ValueError):
                pass
            # Fall back to comma-separated
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

