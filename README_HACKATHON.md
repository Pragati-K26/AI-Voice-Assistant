# FinVoice AI - Hackathon Submission

## 🚀 Project Overview
FinVoice AI is a next-gen voice banking assistant designed to make financial operations accessible, secure, and hands-free. It solves the problem of complex banking menus by allowing users to perform tasks like transfers, balance checks, and KYC using natural language.

## ✨ Key Features
- **Voice-First Banking**: "Transfer 500 to Rahul", "Check balance", "How to do KYC".
- **Smart Intent Recognition**: Powered by **Google Gemini 1.5 Flash**, handling complex queries and entity extraction (amount, recipient).
- **Secure Transactions**: OTP verification flow for high-value transfers (> ₹10,000).
- **Visual Dashboard**: Real-time spending analytics, notifications, and quick actions.
- **Multilingual Support**: Built-in architecture for supporting multiple Indian languages.
- **Branch Locator**: Find nearby ATMs and branches.
- **Investment Portfolio**: Track mutual funds and stocks.

## 🛠️ Tech Stack
- **Frontend**: Next.js, Tailwind CSS, Chart.js (Canvas)
- **Backend**: FastAPI, Python
- **AI/ML**: Google Gemini API (Intent Recognition), OpenAI Whisper (Speech-to-Text)
- **Database**: Mock Data (Architecture ready for PostgreSQL)

## 🏃‍♂️ How to Run Locally

1. **Backend**
   ```bash
   cd backend
   # Create .env with GEMINI_API_KEY
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
   ```

2. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## 🌐 Deployment
- **Frontend**: Deployed on Vercel
- **Backend**: Dockerized (Ready for Render/Railway/AWS)

## 💡 Innovation
Unlike standard chatbots, FinVoice uses a **hybrid dialogue manager** that combines LLM intelligence with strict banking security rules (OTP, confirmation flows), ensuring both flexibility and safety.
