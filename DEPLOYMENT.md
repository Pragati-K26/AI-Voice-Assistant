# Deployment Guide - Google Cloud Platform

This guide walks you through deploying the AI Voice Banking Assistant to Google Cloud Platform.

## Prerequisites

1. **Google Cloud Account**: Sign up at [cloud.google.com](https://cloud.google.com)
2. **Google Cloud SDK**: Install [gcloud CLI](https://cloud.google.com/sdk/docs/install)
3. **Docker**: Install [Docker](https://www.docker.com/get-started)

## Setup

### 1. Initialize Google Cloud Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project (or use existing)
gcloud projects create voice-banking-assistant --name="Voice Banking Assistant"

# Set the project as default
gcloud config set project voice-banking-assistant

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable sql-component.googleapis.com
```

### 2. Configure Environment Variables

#### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

For Cloud Run, set environment variables:

```bash
gcloud run services update voice-banking-backend \
  --set-env-vars="WHISPER_MODEL=base,TTS_ENGINE=gtts,DATABASE_URL=sqlite:///./banking_assistant.db" \
  --region=us-central1
```

#### Frontend Environment Variables

Update `frontend/cloudbuild.yaml` with your backend API URL:

```yaml
substitutions:
  _API_URL: 'https://voice-banking-backend-xxxxx.run.app'
```

## Deployment Methods

### Method 1: Using Cloud Build (Recommended)

#### Deploy Backend

```bash
# From project root
cd backend

# Submit build to Cloud Build
gcloud builds submit --config=cloudbuild.yaml .

# The build will automatically deploy to Cloud Run
```

#### Deploy Frontend

```bash
# From project root
cd frontend

# Submit build to Cloud Build
gcloud builds submit --config=cloudbuild.yaml .
```

### Method 2: Manual Docker Build and Deploy

#### Backend

```bash
# Build Docker image
cd backend
docker build -t gcr.io/YOUR_PROJECT_ID/voice-banking-backend:latest .

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/voice-banking-backend:latest

# Deploy to Cloud Run
gcloud run deploy voice-banking-backend \
  --image gcr.io/YOUR_PROJECT_ID/voice-banking-backend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 300 \
  --max-instances 10
```

#### Frontend

```bash
# Build Docker image
cd frontend
docker build -t gcr.io/YOUR_PROJECT_ID/voice-banking-frontend:latest .

# Push to Container Registry
docker push gcr.io/YOUR_PROJECT_ID/voice-banking-frontend:latest

# Deploy to Cloud Run
gcloud run deploy voice-banking-frontend \
  --image gcr.io/YOUR_PROJECT_ID/voice-banking-frontend:latest \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --set-env-vars="API_URL=https://voice-banking-backend-xxxxx.run.app"
```

### Method 3: Using Cloud SQL (Production Database)

For production, use Cloud SQL instead of SQLite:

```bash
# Create Cloud SQL instance
gcloud sql instances create voice-banking-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=us-central1

# Create database
gcloud sql databases create banking_db --instance=voice-banking-db

# Create user
gcloud sql users create dbuser --instance=voice-banking-db --password=YOUR_PASSWORD

# Update backend environment variable
gcloud run services update voice-banking-backend \
  --set-env-vars="DATABASE_URL=postgresql://dbuser:YOUR_PASSWORD@/banking_db?host=/cloudsql/PROJECT_ID:us-central1:voice-banking-db" \
  --add-cloudsql-instances=PROJECT_ID:us-central1:voice-banking-db \
  --region=us-central1
```

## Post-Deployment

### 1. Initialize Database

```bash
# Get the backend service URL
BACKEND_URL=$(gcloud run services describe voice-banking-backend --region=us-central1 --format='value(status.url)')

# SSH into a Cloud Run instance or use Cloud Shell
# Run database initialization script
python backend/scripts/init_db.py
```

### 2. Update Frontend API URL

Update the frontend environment variable with the actual backend URL:

```bash
gcloud run services update voice-banking-frontend \
  --set-env-vars="API_URL=$BACKEND_URL" \
  --region=us-central1
```

### 3. Configure CORS

Update backend CORS settings in `backend/app/core/config.py`:

```python
ALLOWED_ORIGINS: List[str] = [
    "https://voice-banking-frontend-xxxxx.run.app",
    # Add your frontend URL
]
```

## Monitoring and Logs

### View Logs

```bash
# Backend logs
gcloud run services logs read voice-banking-backend --region=us-central1

# Frontend logs
gcloud run services logs read voice-banking-frontend --region=us-central1
```

### Monitoring

- Cloud Run metrics are available in Google Cloud Console
- Set up alerts for error rates, latency, and request counts

## Scaling Configuration

Adjust scaling in `cloudbuild.yaml`:

```yaml
--min-instances=1
--max-instances=10
--cpu-throttling
```

Or update existing service:

```bash
gcloud run services update voice-banking-backend \
  --min-instances=1 \
  --max-instances=10 \
  --region=us-central1
```

## Cost Optimization

1. **Use smaller instances** for development
2. **Set minimum instances to 0** for low-traffic periods
3. **Use Cloud SQL smallest tier** for development
4. **Enable request-based scaling** to handle traffic spikes

## Security

1. **Enable authentication** for Cloud Run services in production:
   ```bash
   gcloud run services update voice-banking-backend \
     --no-allow-unauthenticated \
     --region=us-central1
   ```

2. **Use secrets** for sensitive environment variables:
   ```bash
   echo -n "your-secret-key" | gcloud secrets create jwt-secret --data-file=-
   ```

3. **Enable HTTPS** (automatically enabled for Cloud Run)

4. **Configure CORS** properly to restrict origins

## Troubleshooting

### Common Issues

1. **Build fails**: Check Cloud Build logs in Console
2. **Service won't start**: Check container logs for errors
3. **CORS errors**: Verify ALLOWED_ORIGINS in backend config
4. **Database connection errors**: Verify DATABASE_URL and Cloud SQL connection

### Debugging

```bash
# Check service status
gcloud run services describe voice-banking-backend --region=us-central1

# View recent logs
gcloud run services logs read voice-banking-backend --limit=50 --region=us-central1

# Test locally with Cloud SQL proxy
cloud_sql_proxy -instances=PROJECT_ID:us-central1:voice-banking-db=tcp:5432
```

## Next Steps

1. Set up custom domain
2. Configure Cloud CDN for frontend
3. Set up CI/CD pipeline
4. Implement monitoring and alerts
5. Configure backup strategy for database

