# Project Structure

```
automated-financial-transaction/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py            # FastAPI application entry point
│   │   ├── core/
│   │   │   ├── config.py      # Application configuration
│   │   │   └── database.py    # Database setup
│   │   ├── models/            # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── transaction.py
│   │   │   └── session.py
│   │   ├── routers/           # API routes
│   │   │   ├── auth.py        # Authentication endpoints
│   │   │   ├── banking.py     # Banking operations
│   │   │   └── voice.py       # Voice processing
│   │   └── services/          # Business logic
│   │       ├── speech_to_text.py      # Whisper STT
│   │       ├── intent_recognition.py  # BERT-based NLU
│   │       ├── dialogue_manager.py    # Conversation flow
│   │       ├── text_to_speech.py      # TTS service
│   │       ├── banking_service.py     # Banking operations
│   │       └── auth_service.py        # Authentication
│   ├── scripts/
│   │   └── init_db.py         # Database initialization
│   ├── Dockerfile
│   ├── cloudbuild.yaml        # Google Cloud Build config
│   ├── app.yaml               # App Engine config (optional)
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/                  # Next.js frontend
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Main page
│   │   └── globals.css
│   ├── components/
│   │   ├── Login.tsx          # Login component
│   │   └── VoiceAssistant.tsx # Main voice UI
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   ├── Dockerfile
│   ├── cloudbuild.yaml        # Google Cloud Build config
│   ├── package.json
│   └── tsconfig.json
│
├── docker-compose.yml         # Local development
├── Makefile                   # Development shortcuts
├── README.md                  # Main documentation
├── SETUP.md                   # Detailed setup guide
├── DEPLOYMENT.md              # Google Cloud deployment
├── QUICKSTART.md              # Quick start guide
└── .gitignore
```

## Key Components

### Backend Services

1. **Speech-to-Text (STT)**: Uses OpenAI Whisper for audio transcription
2. **Intent Recognition**: BERT-based model for understanding user intent
3. **Dialogue Manager**: Manages conversation flow and context
4. **Text-to-Speech (TTS)**: Converts responses to audio
5. **Banking Service**: Mock banking operations
6. **Auth Service**: JWT-based authentication with OTP support

### Frontend Components

1. **VoiceAssistant**: Main voice interaction UI with Web Speech API
2. **Login**: Authentication interface
3. **AuthContext**: React context for auth state management

### Deployment

- **Docker**: Containerized applications
- **Cloud Run**: Serverless container deployment on GCP
- **Cloud Build**: CI/CD pipeline configuration

## Data Flow

```
User Voice Input
    ↓
Web Speech API (Browser)
    ↓
Frontend → POST /api/voice/process
    ↓
Backend:
    ↓
1. Speech-to-Text (Whisper)
    ↓
2. Intent Recognition (BERT)
    ↓
3. Entity Extraction
    ↓
4. Dialogue Management
    ↓
5. Banking Service (if action needed)
    ↓
6. Response Generation
    ↓
7. Text-to-Speech (optional)
    ↓
Frontend displays response
```

