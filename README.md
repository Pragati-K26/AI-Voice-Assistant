# AI Voice Assistant for Financial Operations

An AI-powered Voice Banking Assistant that enables users to perform secure financial operations through natural voice interactions.

## Features

- 🎤 **Voice-based Banking Operations**: Check balances, transfer funds, view transactions
- 🔒 **Secure Authentication**: Voice PIN, OTP verification, biometric support
- 💬 **Natural Language Understanding**: Context-aware conversations with intent recognition
- 🌍 **Multilingual Support**: Support for multiple languages and accents
- 🚀 **Google Cloud Deployment**: Fully configured for Cloud Run and Cloud Functions

## Core Features

- Account balance inquiries
- Fund transfers/payments (mock API)
- Transaction history access
- Loan, interest, credit inquiries
- Reminders and alerts

## Architecture

```
┌─────────────┐
│   Frontend  │ (React/Next.js with Web Speech API)
│   (Voice UI)│
└──────┬──────┘
       │ HTTP/WebSocket
       ▼
┌─────────────────────────────────────┐
│         Backend API (FastAPI)       │
├─────────────────────────────────────┤
│  • Speech-to-Text (Whisper)         │
│  • NLU/Intent (BERT-based)          │
│  • Dialogue Management              │
│  • Text-to-Speech (TTS)             │
│  • Authentication                   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│      Mock Banking APIs              │
│  • Account Services                 │
│  • Transfer Services                │
│  • Transaction Services             │
│  • Loan Services                    │
└─────────────────────────────────────┘
```

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Whisper (OpenAI)**: Speech-to-Text
- **BERT/DistilBERT**: Intent Recognition
- **Coqui TTS / Google TTS**: Text-to-Speech
- **SQLite/PostgreSQL**: Data storage

### Frontend
- **React/Next.js**: Web UI
- **Web Speech API**: Browser voice input
- **WebSocket**: Real-time communication

### Deployment
- **Google Cloud Run**: Containerized backend
- **Google Cloud Functions**: Serverless components
- **Cloud Storage**: Model storage
- **Cloud SQL**: Database (optional)

## Setup

### Prerequisites
- Python 3.9+
- Node.js 18+
- Google Cloud SDK

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python -m app.main
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Deployment to Google Cloud

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Usage

1. Start the backend API
2. Launch the frontend application
3. Click the microphone button
4. Speak your banking request (e.g., "Transfer ₹2,000 to Akash")
5. The assistant will process your request and respond

## Security

- Voice-based authentication
- OTP verification for sensitive operations
- Mock APIs (no real customer data)
- Secure session management

## License

MIT

