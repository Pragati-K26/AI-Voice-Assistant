# Setup Guide

Complete setup instructions for the AI Voice Banking Assistant.

## Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn
- FFmpeg (for audio processing)

## Backend Setup

### 1. Install Python Dependencies

```bash
cd backend
python -m venv venv

# On Windows
venv\Scripts\activate

# On macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Initialize Database

```bash
python scripts/init_db.py
```

This will create:
- SQLite database with schema
- Sample users:
  - Username: `demo_user`, Password: `demo123`, Voice PIN: `1234`
  - Username: `test_user`, Password: `test123`, Voice PIN: `1234`

### 4. Start Backend Server

```bash
python -m app.main
# Or
uvicorn app.main:app --reload
```

Backend will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Create `.env.local`:

```env
API_URL=http://localhost:8000
```

### 3. Start Development Server

```bash
npm run dev
```

Frontend will be available at `http://localhost:3000`

## Using Docker (Alternative)

### Build and Run with Docker Compose

```bash
# From project root
docker-compose up --build
```

This will start both backend and frontend services.

### Individual Services

```bash
# Backend only
cd backend
docker build -t voice-banking-backend .
docker run -p 8000:8000 voice-banking-backend

# Frontend only
cd frontend
docker build -t voice-banking-frontend .
docker run -p 3000:3000 -e API_URL=http://localhost:8000 voice-banking-frontend
```

## Testing the Application

1. **Login**: Use demo credentials
   - Username: `demo_user`
   - Password: `demo123`

2. **Voice Commands**: Try these examples
   - "Check my balance"
   - "Transfer ₹2000 to Akash"
   - "Show my transactions"
   - "What are the interest rates?"
   - "What is my loan balance?"

3. **Browser Compatibility**: 
   - Chrome/Edge: Full voice support
   - Firefox: Limited voice support
   - Safari: Limited voice support

## Troubleshooting

### Backend Issues

**Whisper model download**
- First run will download Whisper model (~150MB for base model)
- Ensure stable internet connection

**Audio processing errors**
- Install FFmpeg: `sudo apt-get install ffmpeg` (Linux) or `brew install ffmpeg` (macOS)

**Database errors**
- Delete `banking_assistant.db` and run `init_db.py` again

### Frontend Issues

**Web Speech API not working**
- Use Chrome or Edge browser
- Ensure HTTPS (or localhost)
- Check microphone permissions

**CORS errors**
- Verify `ALLOWED_ORIGINS` in backend `.env`
- Add frontend URL if using custom port

**Build errors**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`

## Development Tips

1. **API Testing**: Use Swagger UI at `http://localhost:8000/docs`
2. **Database Browser**: Use DB Browser for SQLite
3. **Logs**: Check console for backend logs and browser console for frontend logs
4. **Hot Reload**: Both services support hot reload during development

## Next Steps

- See [DEPLOYMENT.md](DEPLOYMENT.md) for Google Cloud deployment
- Customize voice commands and responses
- Add more banking features
- Train custom models for better accuracy

