# 🏦 AI Voice Assistant for Financial Operations

An AI-powered Voice Banking Assistant with a modern dark glassmorphism UI that enables users to perform secure financial operations through natural voice interactions. Built with FastAPI, Next.js, and fine-tuned Banking77 BERT models.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Python](https://img.shields.io/badge/python-3.9+-green)
![Next.js](https://img.shields.io/badge/next.js-14.0.4-black)
![License](https://img.shields.io/badge/license-MIT-yellow)

## ✨ Features

### 🎯 Core Functionality
- 🎤 **Voice-based Banking Operations**: Check balances, transfer funds, view transactions using natural language
- 🔒 **Secure Authentication**: Voice PIN, OTP verification, JWT token-based security
- 💬 **Advanced NLU**: Banking77 fine-tuned BERT model (77 banking intents, 90-95% accuracy)
- 📊 **Personalized Financial Assistant**: Real-time spending tracking, categorization, and insights
- 🛡️ **Fraud Detection**: Real-time suspicious activity monitoring and alerts
- 🔔 **Proactive Notifications**: Low balance, payment due, and transaction alerts
- 🤖 **Multi-turn Conversations**: Context-aware dialogues with intelligent error handling
- 🌍 **Multilingual Support**: Support for multiple languages and accents via Whisper

### 🎨 UI/UX Features
- **Modern Dark Glassmorphism Theme**: Beautiful dark UI with glassmorphic effects and backdrop blur
- **Smooth Animations**: Fade-in, stagger, shimmer, floating, and pulse animations
- **Responsive Design**: Fully responsive, works seamlessly on desktop, tablet, and mobile
- **Interactive Components**: Hover effects, scale transforms, glow effects, and smooth transitions
- **Gradient Text**: Beautiful gradient text effects for headings and important values
- **Custom Scrollbars**: Themed scrollbars matching the dark aesthetic
- **Consistent Theming**: All components follow the same design language

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend Layer                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Next.js 14 + React 18                            │  │
│  │  • Dark Glassmorphism UI                          │  │
│  │  • Web Speech API (Voice Input)                   │  │
│  │  • Real-time WebSocket Communication              │  │
│  │  • Responsive Components                          │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP/WebSocket
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend API Layer                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  FastAPI + Python 3.11                           │  │
│  │  • Speech-to-Text (OpenAI Whisper)               │  │
│  │  • Intent Recognition (Banking77 BERT)           │  │
│  │  • Dialogue Management                          │  │
│  │  • Text-to-Speech (gTTS)                        │  │
│  │  • Authentication & Authorization              │  │
│  │  • Entity Extraction                            │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Banking Services Layer                  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  • Account Balance Services                      │  │
│  │  • Fund Transfer Services                        │  │
│  │  • Transaction History Services                  │  │
│  │  • Loan & Credit Services                        │  │
│  │  • Spending Tracker                              │  │
│  │  • Notification Services                         │  │
│  │  • Card Management Services                      │  │
│  └──────────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
│  ┌──────────────────────────────────────────────────┐  │
│  │  SQLite Database (Development)                   │  │
│  │  PostgreSQL (Production)                         │  │
│  │  • User Management                               │  │
│  │  • Transaction Records                           │  │
│  │  • Session Management                           │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🛠️ Tech Stack

### Backend
- **FastAPI 0.104.1**: Modern, fast Python web framework
- **OpenAI Whisper**: State-of-the-art speech-to-text
- **Banking77 Fine-tuned BERT**: Intent recognition (77 banking intents)
  - Base Models: DistilBERT/RoBERTa
  - Accuracy: ~90-95%
  - F1 Score: ~0.90-0.95
- **PyTorch 2.7.1**: Deep learning framework with CUDA 11.8 support
- **Transformers 4.36.0**: Hugging Face transformers library
- **gTTS**: Google Text-to-Speech
- **SQLAlchemy**: ORM for database operations
- **JWT**: Secure token-based authentication

### Frontend
- **Next.js 14.0.4**: React framework with App Router
- **React 18.2.0**: UI library
- **TypeScript**: Type-safe development
- **Tailwind CSS 3.3.6**: Utility-first CSS framework
- **Web Speech API**: Browser-based voice recognition
- **Axios**: HTTP client for API calls
- **WebSocket**: Real-time bidirectional communication

### AI/ML
- **Banking77 Dataset**: 10,000+ training examples, 77 intents
- **BERT-based Models**: Pre-trained language models
- **Custom Intent Mapping**: Banking77 → Application intents
- **Entity Extraction**: Amount, recipient, category, period extraction

## 🚀 Quick Start

### Prerequisites
- **Python 3.9+** (Python 3.11 recommended)
- **Node.js 18+** (Node.js 20+ recommended)
- **NVIDIA GPU** (optional, for faster model training)
- **CUDA Toolkit 11.8+** (if using GPU)

### Installation

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd ai-voice-assistant
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
python scripts/init_db.py

# Start the server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

#### 4. Train Banking77 Model (Recommended)

For optimal intent recognition accuracy:

```bash
# Automated training (recommended)
cd scripts
python train_and_integrate.py

# Or manual step-by-step
python create_intent_mapping.py
python fine_tune_intent_model.py \
    --model distilbert-base-uncased \
    --epochs 3 \
    --batch-size 16 \
    --output ../models/banking77-intent
```

**Training Time Estimates:**
- GPU (RTX 4050): ~15-30 minutes
- CPU: ~1-2 hours

The model will be automatically detected and loaded by the backend.

#### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000
- **API Documentation**: http://127.0.0.1:8000/docs
- **Health Check**: http://127.0.0.1:8000/health

### Quick Start Scripts (Windows)

```bash
# Start both servers
.\start-all.bat

# Or individually
.\start-backend.bat
.\start-frontend.bat
```

## 🎨 UI Theme & Design

### Dark Glassmorphism Theme

The application features a cohesive dark glassmorphism design system:

#### Color Palette
- **Background**: Slate-900 to Purple-900 gradient
- **Primary Accents**: Blue (#60a5fa), Purple (#a78bfa), Pink (#f472b6)
- **Text**: White with opacity variations (90%, 70%, 60%)
- **Glass Effects**: rgba(255, 255, 255, 0.1) with backdrop blur

#### Animation System
- **Fade-in**: Smooth entry animations
- **Stagger**: Sequential element appearance
- **Shimmer**: Subtle shimmer effects on cards
- **Float**: Gentle floating animations
- **Pulse**: Attention-grabbing pulse effects
- **Slide-in**: Horizontal slide animations

#### Component Styling
All components use consistent glassmorphic styling:
- **Cards**: Glass effect with backdrop blur, subtle borders
- **Buttons**: Hover scale transforms, glow effects
- **Inputs**: Glass backgrounds with focus rings
- **Icons**: Color-coded with hover effects

## 🤖 Banking77 Model Integration

### Overview

Banking77 is a specialized dataset for banking intent recognition with:
- **77 unique banking intents**
- **10,000+ training examples**
- **High-quality labeled data**

We fine-tune BERT-based models on this dataset for superior intent recognition.

### Training Process

1. **Data Loading**: Loads from `banking77data/` CSV files
2. **Preprocessing**: Tokenization and label mapping
3. **Fine-tuning**: Trains on Banking77 dataset
4. **Evaluation**: Tests on held-out test set
5. **Integration**: Automatically loaded by backend

### Model Architecture

- **Base Model**: DistilBERT (fast) or RoBERTa (accurate)
- **Task**: Sequence Classification
- **Input**: User text query (max 512 tokens)
- **Output**: Intent class with confidence score
- **Mapping**: Banking77 intents → Application intents

### Intent Mapping

The system automatically maps 77 Banking77 intents to 18 application intents:

| Banking77 Category | Application Intent |
|-------------------|-------------------|
| Balance queries | `check_balance` |
| Transfer queries | `transfer_funds` |
| Transaction history | `view_transactions` |
| Loan queries | `loan_inquiry` |
| Interest queries | `interest_inquiry` |
| Credit card queries | `credit_limit_inquiry` / `manage_card` |
| Payment queries | `payment_alert` |
| Spending queries | `spending_summary` |
| Notification queries | `view_notifications` |
| Reminder queries | `set_reminder` |

See [BANKING77_TRAINING_GUIDE.md](BANKING77_TRAINING_GUIDE.md) for detailed training instructions.

## 📖 Usage Guide

### Login Credentials
- **Username**: `demo_user`
- **Password**: `demo123`
- **Voice PIN**: `1234`

### Voice Commands

#### Balance & Account
- "What is my account balance?"
- "Check my balance"
- "How much money do I have?"
- "Show my credit limit"

#### Transfers & Payments
- "Transfer ₹5,000 to Akash"
- "Send ₹2,000 to Rahul"
- "Pay my electricity bill"
- "Transfer money to account 1234567890"

#### Transactions
- "Show my recent transactions"
- "What are my last 10 transactions?"
- "Show transaction history for this month"

#### Spending & Expenses
- "What is my spending this month?"
- "Show my spending summary"
- "How much did I spend on food?"
- "What are my expenses by category?"

#### Loans & Credit
- "What is my loan balance?"
- "Check my loan information"
- "What is the interest rate?"
- "Show my credit card details"

#### Notifications & Alerts
- "Show my notifications"
- "What alerts do I have?"
- "Are there any action required items?"

### Features by Tab

#### 1. Dashboard
- Account balance overview
- Monthly spending summary
- Notification count
- Recent transactions preview
- Quick action buttons

#### 2. Banking Services
- Check balance
- View transactions
- Transfer funds
- Loan information
- Interest rates
- Credit limit

#### 3. Spending Insights
- Total spending by period
- Category-wise breakdown
- Visual progress bars
- Top spending category
- Savings calculation
- Period selector (week/month/year)

#### 4. Cards & Services
- Credit/debit card management
- Block/unblock cards
- Set spending limits
- Request cheque book
- Branch locator
- Investment services

#### 5. Notifications
- Color-coded by severity
- Action required badges
- Filter and manage alerts
- Real-time updates

#### 6. Voice Assistant
- Interactive chat interface
- Real-time voice recognition
- Text input fallback
- Conversation history
- Intent display

#### 7. Settings
- Account information
- Notification preferences
- Security settings
- Password change
- Voice PIN update
- Two-factor authentication

## 🔧 Configuration

### Environment Variables

**Backend** (`.env` in `backend/`):
```env
DATABASE_URL=sqlite:///./banking_assistant.db
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

**Frontend** (`.env.local` in `frontend/`):
```env
API_URL=http://localhost:8000
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Model Configuration

The intent recognition service automatically searches for models in:
1. `./models/banking77-intent/`
2. `../models/banking77-intent/`
3. `models/banking77-intent/`
4. Relative to backend directory

## 📁 Project Structure

```
ai-voice-assistant/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── core/              # Configuration, database
│   │   ├── models/             # SQLAlchemy models
│   │   ├── routers/            # API endpoints
│   │   │   ├── auth.py        # Authentication
│   │   │   ├── banking.py     # Banking operations
│   │   │   └── voice.py       # Voice processing
│   │   └── services/           # Business logic
│   │       ├── intent_recognition.py    # Banking77 model
│   │       ├── speech_to_text.py        # Whisper STT
│   │       ├── dialogue_manager.py      # Conversation flow
│   │       ├── banking_service.py       # Banking operations
│   │       └── spending_tracker.py      # Spending analysis
│   ├── scripts/
│   │   └── init_db.py         # Database initialization
│   └── requirements.txt
│
├── frontend/                    # Next.js frontend
│   ├── app/                    # Next.js 14 App Router
│   │   ├── globals.css        # Global styles & animations
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Main page
│   ├── components/             # React components
│   │   ├── DashboardOverview.tsx
│   │   ├── BankingServices.tsx
│   │   ├── SpendingInsights.tsx
│   │   ├── CardsAndServices.tsx
│   │   ├── NotificationsTab.tsx
│   │   ├── VoiceChat.tsx
│   │   ├── Settings.tsx
│   │   ├── Login.tsx
│   │   └── icons/              # Custom SVG icons
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication context
│   └── package.json
│
├── banking77data/               # Banking77 dataset
│   ├── banking77_train.csv     # Training data
│   ├── banking77_test.csv      # Test data
│   └── intent_mapping.json     # Intent mappings
│
├── scripts/                     # Training & utility scripts
│   ├── fine_tune_intent_model.py    # Model training
│   ├── create_intent_mapping.py     # Intent mapping
│   ├── train_and_integrate.py       # Automated training
│   ├── download_datasets.py         # Dataset downloader
│   └── check_gpu_setup.py           # GPU verification
│
├── models/                      # Trained models (created after training)
│   └── banking77-intent/
│       ├── config.json
│       ├── pytorch_model.bin
│       ├── tokenizer_config.json
│       ├── label_mapping.json
│       └── intent_mapping.json
│
├── docker-compose.yml           # Docker configuration
├── README.md                   # This file
├── BANKING77_TRAINING_GUIDE.md # Training guide
├── HOW_TO_RUN.md              # Running instructions
└── TRAINING_STATUS.md          # Training status
```

## 🧪 Testing

### Backend Health Check
```bash
curl http://127.0.0.1:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "database": "connected",
  "models": "loaded"
}
```

### Test Intent Recognition
```bash
curl -X POST http://127.0.0.1:8000/api/voice/process \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"text": "What is my balance?"}'
```

### Test Authentication
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "demo_user", "password": "demo123"}'
```

## 🚢 Deployment

### Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f
```

### Google Cloud Run

See deployment documentation for:
- Cloud Run configuration
- Cloud Functions setup
- Cloud Storage for models
- Cloud SQL for database

### Manual Deployment

1. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
   ```

2. **Frontend**:
   ```bash
   cd frontend
   npm run build
   npm start
   ```

## 📚 Documentation

- **[HOW_TO_RUN.md](HOW_TO_RUN.md)**: Detailed step-by-step running instructions
- **[BANKING77_TRAINING_GUIDE.md](BANKING77_TRAINING_GUIDE.md)**: Complete model training guide
- **[TRAINING_GUIDE.md](TRAINING_GUIDE.md)**: General training documentation
- **[TRAINING_STATUS.md](TRAINING_STATUS.md)**: Current training status and monitoring
- **[UI_IMPROVEMENTS.md](UI_IMPROVEMENTS.md)**: UI/UX improvements documentation

## 🐛 Troubleshooting

### Backend Issues

**Port 8000 already in use:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:8000 | xargs kill

# Or use different port
python -m uvicorn app.main:app --port 8001
```

**Model not loading:**
- Verify `models/banking77-intent/` directory exists
- Check `config.json` is present
- Review backend logs for specific errors
- Model will fallback to base model if not found

**Database errors:**
```bash
cd backend
python scripts/init_db.py
```

### Frontend Issues

**Port 3000 in use:**
```bash
# Use different port
npm run dev -- -p 3001
```

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Styling issues:**
- Ensure Tailwind CSS is properly configured
- Check `tailwind.config.js` and `postcss.config.js`
- Verify `globals.css` is imported in `layout.tsx`

### Training Issues

**GPU not detected:**
```bash
# Verify CUDA
python -c "import torch; print('CUDA:', torch.cuda.is_available())"

# Check GPU
nvidia-smi
```
- Training will work on CPU (much slower)
- Ensure CUDA toolkit is installed
- Update GPU drivers if needed

**TensorFlow DLL errors:**
- TensorFlow is not required (we use PyTorch)
- Uninstall if causing issues: `pip uninstall tensorflow tensorflow-intel`
- The training script automatically disables TensorFlow

**Out of memory:**
- Reduce batch size: `--batch-size 8`
- Use smaller model: `--model distilbert-base-uncased`
- Reduce max sequence length in script

### Connection Issues

**Frontend can't connect to backend:**
- Verify backend is running on port 8000
- Check `API_URL` in frontend `.env.local`
- Verify CORS settings in backend
- Check firewall settings

## 🔐 Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt password hashing
- **OTP Verification**: For sensitive operations
- **Session Management**: Secure session handling
- **CORS Protection**: Configured allowed origins
- **Input Validation**: Pydantic models for validation

## 🚀 Performance

### Backend
- **Response Time**: < 200ms for most operations
- **Intent Recognition**: < 100ms with Banking77 model
- **Speech-to-Text**: ~1-2 seconds per utterance
- **Concurrent Users**: Supports multiple simultaneous users

### Frontend
- **Initial Load**: < 2 seconds
- **Page Transitions**: Smooth, < 100ms
- **Animations**: 60 FPS with GPU acceleration
- **Bundle Size**: Optimized with Next.js

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow PEP 8 for Python code
- Use TypeScript for frontend
- Write descriptive commit messages
- Add tests for new features
- Update documentation

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- **Banking77 Dataset**: For providing high-quality banking intent data
- **Hugging Face**: For Transformers library and model hub
- **OpenAI**: For Whisper speech recognition model
- **Next.js Team**: For the amazing React framework
- **FastAPI**: For the modern Python web framework
- **Tailwind CSS**: For the utility-first CSS framework

## 📞 Support & Contact

For issues, questions, or contributions:
- Check the documentation files in the repository
- Review the troubleshooting section
- Check backend/frontend logs for errors
- Open an issue on GitHub

## 🎯 Roadmap

### Planned Features
- [ ] Multi-language support expansion
- [ ] Advanced fraud detection with ML
- [ ] Mobile app (React Native)
- [ ] Voice biometric authentication
- [ ] Real-time transaction notifications
- [ ] Advanced spending analytics
- [ ] Integration with real banking APIs
- [ ] Voice command customization

### Recent Updates
- ✅ Dark glassmorphism theme implementation
- ✅ Banking77 model integration
- ✅ Enhanced animations and effects
- ✅ Improved component consistency
- ✅ GPU-accelerated training support
- ✅ Comprehensive documentation

---

**Built with ❤️ using FastAPI, Next.js, PyTorch, and Banking77**

*Last Updated: November 2025*
