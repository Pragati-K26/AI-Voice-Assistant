# Model and Dataset Recommendations - Quick Reference

## 🎯 Quick Start

### 1. Download Banking77 Dataset
```bash
python scripts/download_datasets.py
```

### 2. Fine-tune Intent Model
```bash
python scripts/fine_tune_intent_model.py --model roberta-base --epochs 5
```

### 3. Update Backend Config
```python
# backend/app/core/config.py
INTENT_MODEL_PATH = "models/banking77-intent"
```

## 📊 Top Recommendations

### Intent Recognition
1. **RoBERTa-base** + Banking77 (Best accuracy)
2. **DistilBERT** + Banking77 (Faster, good accuracy)
3. **FinBERT** (Financial domain pre-trained)

### Speech-to-Text
1. **Whisper Large-v3** (Best quality, multilingual)
2. **Google Cloud Speech-to-Text** (Production API)
3. **Azure Speech Services** (Production API)

### Text-to-Speech
1. **Google Cloud TTS Neural2** (Production)
2. **Coqui TTS** (Open source)
3. **Azure Neural TTS** (Production)

## 📚 Key Datasets

1. **Banking77** ⭐ (Primary dataset)
   - 77 banking intents
   - 13,083 queries
   - Available on HuggingFace

2. **CommonVoice** (Speech training)
   - 100+ languages
   - Free and open

3. **BFSI Speech Dataset** (Banking audio)
   - Real call center audio
   - May require license

## 📖 Full Documentation

- **MODELS_AND_DATASETS.md**: Complete model and dataset recommendations
- **TRAINING_GUIDE.md**: Step-by-step training instructions
- **scripts/download_datasets.py**: Automated dataset downloader
- **scripts/fine_tune_intent_model.py**: Model training script

## 🚀 Production Checklist

- [ ] Download Banking77 dataset
- [ ] Fine-tune intent model on Banking77
- [ ] Collect custom banking data
- [ ] Fine-tune Whisper on banking audio
- [ ] Evaluate model performance
- [ ] Deploy to staging environment
- [ ] A/B test with baseline
- [ ] Monitor production metrics
- [ ] Continuous improvement cycle

