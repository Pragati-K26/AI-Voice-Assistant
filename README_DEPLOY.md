# Deployment Guide
This project consists of a **FastAPI Backend** and a **Next.js Frontend**.

## Backend Deployment (Render / Railway / AWS)
1. **Environment Variables**:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `SECRET_KEY`: A random string for JWT.
   - `ALLOWED_ORIGINS`: `["https://your-frontend-domain.com"]` (or `*` for testing).

2. **Docker**:
   - A `Dockerfile` is provided in the `backend` directory.
   - Build command: `docker build -t finvoice-backend .`
   - Run command: `docker run -p 8000:8000 finvoice-backend`

3. **Manual Run**:
   - Install dependencies: `pip install -r requirements.txt`
   - Run: `uvicorn app.main:app --host 0.0.0.0 --port 8000`

## Frontend Deployment (Vercel / Netlify)
1. **Environment Variables**:
   - `API_URL` or `NEXT_PUBLIC_API_URL`: The URL of your deployed backend (e.g., `https://finvoice-backend.onrender.com`).

2. **Vercel**:
   - Connect your GitHub repository.
   - Set the Root Directory to `frontend`.
   - Add the environment variables.
   - Deploy.

## Local Development
1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python -m uvicorn app.main:app --reload
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
