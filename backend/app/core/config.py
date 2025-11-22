"""
Application configuration
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""
    
    # Application
    APP_NAME: str = "AI Voice Banking Assistant"
    DEBUG: bool = False
    SECRET_KEY: str = "your-secret-key-change-in-production"
    
    # CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
    ]
    
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
    
    # Google Cloud
    GCP_PROJECT_ID: str = ""
    GCP_BUCKET_NAME: str = ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

