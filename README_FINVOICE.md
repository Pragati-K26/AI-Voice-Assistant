# FinVoice AI - Next Gen Voice Banking

FinVoice AI is a fully functional, multilingual voice banking assistant designed to make finance accessible to everyone.

## Features Implemented

### 1. Multilingual Voice Banking
- **Languages**: Supports Hindi, Marathi, Tamil, Bengali, Gujarati, and English.
- **Technology**: Uses OpenAI Whisper (Backend) for high-accuracy transcription and translation to English.
- **Usage**: Select your language in the UI, click the mic, and speak naturally.
  - *Example (Hindi)*: "Mera balance kya hai?" -> Assistant: "Your current account balance is ₹25,000.00"

### 2. Conversational KYC & Onboarding
- **Intent**: "I want to open an account" or "Complete KYC".
- **Flow**: The assistant guides you through the process (mocked for demo) by asking for document uploads.

### 3. Card Controls
- **Block/Unblock**: "Block my debit card" or "Unblock my credit card".
- **Set Limits**: "Set spending limit to 5000 rupees".

### 4. Smart Banking Operations
- **Check Balance**: "How much money do I have?"
- **Transfer Funds**: "Transfer 500 rupees to Rahul".
- **Spending Summary**: "Where did I spend my money last month?"
- **Fraud Detection**: Automatically flags large or rapid transactions.

## Tech Stack
- **Frontend**: Next.js, Tailwind CSS, Web Speech API + MediaRecorder.
- **Backend**: FastAPI, PyTorch, Transformers (Whisper & BERT).
- **Models**: 
  - `openai/whisper` (or fine-tuned) for ASR & Translation.
  - `banking77` (BERT) for Intent Recognition.

## How to Run
1. **Backend**:
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8002
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
   Access at [http://localhost:3000](http://localhost:3000).

## "Hackable" & Scalable
- Add new intents in `backend/app/services/intent_recognition.py`.
- Customize dialogue in `backend/app/services/dialogue_manager.py`.
- Switch models in `backend/app/core/config.py`.
