# Recommended Models and Datasets for Production

This document provides comprehensive recommendations for models and datasets to use in production for the AI Voice Banking Assistant.

## Table of Contents

1. [Speech-to-Text (ASR) Models](#speech-to-text-asr-models)
2. [Intent Recognition & NLU Models](#intent-recognition--nlu-models)
3. [Text-to-Speech (TTS) Models](#text-to-speech-tts-models)
4. [Dialogue Management Models](#dialogue-management-models)
5. [Banking-Specific Datasets](#banking-specific-datasets)
6. [Training & Fine-tuning Strategy](#training--fine-tuning-strategy)

---

## Speech-to-Text (ASR) Models

### 1. **Whisper (OpenAI)** - Currently Used
- **Model Options**: `tiny`, `base`, `small`, `medium`, `large-v2`, `large-v3`
- **Pros**: 
  - Multilingual support out-of-the-box
  - Handles accents well
  - Good for banking terminology
- **Cons**: 
  - Can be slow for real-time
  - Large model sizes
- **Recommendation**: Use `whisper-medium` or `whisper-large-v3` for production
- **Fine-tuning**: Fine-tune on banking audio corpus for better domain accuracy

### 2. **Wav2Vec 2.0 (Facebook)**
- **HuggingFace Models**:
  - `facebook/wav2vec2-large-960h` (English)
  - `facebook/wav2vec2-base-960h` (English)
  - `facebook/wav2vec2-large-xlsr-53` (Multilingual)
- **Pros**: 
  - Faster inference than Whisper
  - Good accuracy for clear speech
- **Cons**: 
  - Requires fine-tuning for best results
  - Limited multilingual support compared to Whisper

### 3. **Vosk (Offline ASR)**
- **Model Options**: 
  - `vosk-model-en-us-0.22` (US English, 1.8GB)
  - `vosk-model-small-en-us-0.15` (Small, 40MB)
  - `vosk-model-en-in-0.5` (Indian English)
- **Pros**: 
  - Completely offline
  - Fast, low latency
  - Good for privacy-sensitive applications
- **Cons**: 
  - Lower accuracy than Whisper
  - Limited to specific languages

### 4. **Google Cloud Speech-to-Text API** (Production Option)
- **Model Options**: 
  - `latest_long` (Best for long audio)
  - `latest_short` (Optimized for short utterances)
  - `telephony` (Optimized for phone calls)
- **Pros**: 
  - Enterprise-grade accuracy
  - Real-time streaming
  - Multilingual support
  - Built-in speaker diarization
- **Cons**: 
  - Requires Google Cloud subscription
  - API costs per request

### 5. **Azure Speech Services** (Production Option)
- **Features**: 
  - Custom speech models
  - Real-time transcription
  - Speaker recognition
  - Language customization
- **Pros**: 
  - High accuracy
  - Custom model training support
  - Integration with Azure ecosystem
- **Cons**: 
  - Requires Azure subscription
  - Costs per minute

**Recommendation for Production**: 
- Start with **Whisper Large-v3** (self-hosted for privacy)
- Consider **Google Cloud Speech-to-Text** for production scale
- Fine-tune on banking domain data

---

## Intent Recognition & NLU Models

### 1. **BERT-Based Models (Current)**

#### **DistilBERT** (Currently Used)
- **Model**: `distilbert-base-uncased`
- **Pros**: Fast inference, good baseline
- **Cons**: Not domain-specific
- **Action**: Fine-tune on Banking77 dataset

#### **RoBERTa**
- **Models**: 
  - `roberta-base` (125M parameters)
  - `roberta-large` (355M parameters)
- **Pros**: Better performance than BERT, robust
- **Cons**: Larger model size

#### **Banking-Specific Models**

##### **Banking77 Fine-tuned Models**
- Pre-trained on Banking77 dataset
- Better out-of-the-box performance for banking intents
- Search HuggingFace: `banking77` or `banking-intent`

##### **FinBERT**
- **Model**: `yiyanghkust/finbert-tone` or `ProsusAI/finbert`
- Domain: Financial/Banking
- Trained on financial news and reports
- Good for financial terminology understanding

### 2. **Sentence Transformers** (For Semantic Similarity)

#### **all-MiniLM-L6-v2**
- Fast, lightweight
- Good for intent classification
- 384-dimensional embeddings

#### **all-mpnet-base-v2**
- Better accuracy than MiniLM
- 768-dimensional embeddings
- Slower but more accurate

### 3. **Specialized Banking Models**

#### **IndicBERT** (For Indian Context)
- **Model**: `ai4bharat/indic-bert`
- Supports Hindi, English, and other Indian languages
- Useful for multilingual banking in India

#### **MultiFiT** (Multilingual)
- **Model**: `xlm-roberta-base`
- Multilingual understanding
- Good for mixed-language queries

### 4. **Large Language Models (LLMs) for NLU**

#### **GPT-3.5/GPT-4** (via API)
- Excellent zero-shot intent classification
- Can handle complex queries
- Requires API calls (costs)

#### **Llama 2 / Mistral** (Self-hosted)
- `meta-llama/Llama-2-7b-chat-hf`
- `mistralai/Mistral-7B-Instruct-v0.1`
- Self-hosted alternative to GPT
- Requires GPU resources

**Recommendation for Production**:
1. **Short-term**: Fine-tune `roberta-base` on Banking77 + custom banking data
2. **Medium-term**: Use `FinBERT` or Banking77 fine-tuned models
3. **Long-term**: Consider LLM-based intent classification with RAG (Retrieval-Augmented Generation)

---

## Text-to-Speech (TTS) Models

### 1. **Coqui TTS** (Open Source)
- **Models**:
  - `tts_models/en/ljspeech/tacotron2-DDC` (High quality, slower)
  - `tts_models/en/ljspeech/glow-tts` (Faster, good quality)
  - `tts_models/en/vctk/vits` (Multi-speaker)
- **Pros**: 
  - Open source
  - Multiple voices
  - Can fine-tune on custom voices
- **Cons**: 
  - Requires setup
  - Slower inference

### 2. **Azure Neural TTS** (Production)
- High-quality voices
- Multiple languages and accents
- Custom voice training available
- Natural sounding

### 3. **Google Cloud Text-to-Speech** (Production)
- **Model Options**:
  - `Neural2` (Best quality)
  - `Standard` (Faster, lower cost)
- WaveNet voices available
- SSML support for prosody control

### 4. **ElevenLabs** (High Quality)
- Extremely natural voices
- Voice cloning available
- API-based service

### 5. **Bark (Suno AI)** (Open Source)
- Very natural, includes non-speech sounds
- Can express emotions
- Open source on HuggingFace

**Recommendation**: Use **Coqui TTS** for development, **Google Cloud TTS** or **Azure TTS** for production

---

## Dialogue Management Models

### 1. **Rasa** (Framework)
- Open-source dialogue management
- Supports NLU + Dialogue policies
- Can train custom policies
- Good for banking flows

### 2. **Dialogflow** (Google Cloud)
- Visual dialogue builder
- Pre-built banking templates
- Natural language understanding built-in
- Easy integration

### 3. **ConvBERT / TRADE**
- Transformer-based dialogue state tracking
- Better context handling
- More complex to implement

### 4. **GPT-based Dialogue Management**
- Use GPT-3.5/4 for dialogue flows
- Few-shot learning with examples
- Handles complex conversations
- Requires careful prompt engineering

**Recommendation**: Start with **Rasa** for custom flows, consider **Dialogflow** for quick deployment

---

## Banking-Specific Datasets

### 1. **Banking77** ⭐ (Highly Recommended)
- **Source**: HuggingFace Datasets
- **Dataset ID**: `banking77`
- **Size**: 13,083 customer service queries
- **Intents**: 77 banking intents
- **Language**: English
- **Use Case**: Intent classification
- **Link**: https://huggingface.co/datasets/banking77

### 2. **BFSI Speech Dataset** (FutureBeeAI)
- **Content**: Banking call center audio
- **Format**: Audio with transcripts
- **Language**: English, Hindi (Indian banking)
- **Use Case**: Speech-to-text fine-tuning
- **Availability**: May require purchase/license

### 3. **FinAudio Benchmark**
- **Content**: Financial domain audio data
- **Tasks**: ASR, NLU, sentiment analysis
- **Languages**: Multiple
- **Use Case**: Speech processing in financial domain

### 4. **CLINIC150** (Customer Service Intent Dataset)
- **Source**: Available on GitHub
- **Intents**: 150 customer service intents
- **Size**: 22,500 queries
- **Use Case**: Intent classification (includes banking)

### 5. **Bitext Retail Banking Dataset**
- **Source**: Bitext (may require license)
- **Content**: Banking-specific queries and intents
- **Languages**: Multiple
- **Use Case**: NLU training

### 6. **Wolof Banking Speech Dataset**
- **Content**: Banking audio in Wolof language
- **Use Case**: Multilingual banking support
- **Note**: Specialized for specific regions

### 7. **CommonVoice (Mozilla)**
- **Source**: https://commonvoice.mozilla.org/
- **Size**: 100+ languages, 10,000+ hours
- **Content**: Crowdsourced speech data
- **Use Case**: Multilingual ASR training
- **Languages**: Hindi, English, and many more

### 8. **Indic TTS Corpus**
- **Source**: AI4Bharat
- **Languages**: 13+ Indian languages
- **Content**: Text-to-speech datasets
- **Use Case**: TTS for Indian languages
- **Link**: https://indicnlp.ai4bharat.org/

### 9. **SLURP** (Spoken Language Understanding Resource Package)
- **Content**: Spoken language understanding dataset
- **Intents**: Real-world intents including banking
- **Format**: Audio + transcripts + slot annotations
- **Use Case**: End-to-end SLU training

### 10. **SNIPS** (Now deprecated but archived)
- **Content**: Multi-intent dataset
- **Intents**: Various domains including payments
- **Available**: Archived on GitHub

### 11. **ATIS** (Airline Travel Information System)
- **Content**: Spoken language understanding
- **Similar Structure**: Can adapt for banking
- **Use Case**: Dialogue state tracking training

### 12. **Financial PhraseBank**
- **Source**: HuggingFace
- **Content**: Financial news with sentiment
- **Use Case**: Sentiment analysis in banking context

---

## Training & Fine-tuning Strategy

### Phase 1: Intent Recognition Model

1. **Start with Banking77 Dataset**
   ```python
   from datasets import load_dataset
   dataset = load_dataset("banking77")
   ```

2. **Fine-tune RoBERTa**
   - Use `roberta-base`
   - Train for 3-5 epochs
   - Learning rate: 2e-5
   - Batch size: 16

3. **Add Custom Banking Data**
   - Collect real banking queries
   - Augment with paraphrasing
   - Add domain-specific intents

### Phase 2: Speech-to-Text

1. **Collect Banking Audio Data**
   - Record sample banking conversations
   - Transcribe manually or use Whisper
   - Include various accents

2. **Fine-tune Whisper**
   - Use `whisper-large-v3` as base
   - Fine-tune on banking audio
   - Focus on financial terminology

3. **Test on Real Calls**
   - Deploy to staging
   - Collect user feedback
   - Iterate on model

### Phase 3: Dialogue Management

1. **Build Conversation Flows**
   - Map all banking operations
   - Design multi-turn conversations
   - Handle edge cases

2. **Train Dialogue Policy**
   - Use Rasa or Dialogflow
   - Train on conversation logs
   - A/B test different policies

### Phase 4: Evaluation

**Metrics to Track**:
- Intent Accuracy (F1-score)
- Speech Recognition WER (Word Error Rate)
- Task Completion Rate
- User Satisfaction Score
- Average Handling Time

---

## Implementation Steps

### Step 1: Download and Prepare Banking77 Dataset

```python
from datasets import load_dataset
import pandas as pd

# Load Banking77 dataset
dataset = load_dataset("banking77")

# Explore the dataset
print(dataset)
print(dataset['train'][0])

# Convert to DataFrame
df_train = pd.DataFrame(dataset['train'])
df_test = pd.DataFrame(dataset['test'])

# Save for training
df_train.to_csv('data/banking77_train.csv', index=False)
df_test.to_csv('data/banking77_test.csv', index=False)
```

### Step 2: Fine-tune RoBERTa on Banking77

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from transformers import Trainer, TrainingArguments
import torch

# Load model and tokenizer
model_name = "roberta-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(
    model_name,
    num_labels=77  # Banking77 has 77 intents
)

# Training code (simplified)
training_args = TrainingArguments(
    output_dir='./results',
    num_train_epochs=5,
    per_device_train_batch_size=16,
    learning_rate=2e-5,
    weight_decay=0.01,
)

# Train the model
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=eval_dataset,
)

trainer.train()
trainer.save_model('./models/banking77-roberta')
```

### Step 3: Fine-tune Whisper for Banking

```python
import whisper
from whisper import load_model, fine_tune

# Load base model
model = load_model("large-v3")

# Fine-tune on banking audio
# Note: Requires audio files + transcripts in specific format
fine_tune(
    model,
    data_dir="data/banking_audio",
    output_dir="models/whisper-banking"
)
```

### Step 4: Create Custom Banking Dataset

1. **Collect Real Queries**
   - Customer service logs
   - Chat transcripts
   - Voice call transcripts

2. **Annotate Intents**
   - Use annotation tools (Label Studio, Prodigy)
   - Create intent taxonomy
   - Label at least 100 examples per intent

3. **Data Augmentation**
   - Paraphrasing (using GPT-3.5/4 or Parrot)
   - Synonym replacement
   - Back-translation

---

## Production Deployment Recommendations

### Model Serving

1. **Use HuggingFace Inference API** (Quick Start)
2. **Deploy via TorchServe** (PyTorch models)
3. **Use TensorFlow Serving** (TF models)
4. **ONNX Runtime** (Cross-platform, fast inference)
5. **Triton Inference Server** (NVIDIA GPUs)

### Infrastructure

1. **GPU Requirements**:
   - Whisper Large: 8GB+ GPU
   - RoBERTa: 4GB+ GPU
   - TTS: 2GB+ GPU

2. **Cloud Options**:
   - AWS SageMaker
   - Google Cloud AI Platform
   - Azure ML
   - HuggingFace Inference Endpoints

3. **Cost Optimization**:
   - Use quantization (8-bit, 4-bit)
   - Model distillation (smaller models)
   - Caching for common queries
   - Batch inference where possible

---

## Quick Start: Download and Use Banking77

```bash
# Install datasets library
pip install datasets

# Python code
from datasets import load_dataset

# Load Banking77
dataset = load_dataset("banking77")

# View sample
print(dataset['train'][0])
# Output: {'text': 'How do I transfer money?', 'label': 0}

# Get all intents
intents = dataset['train'].features['label'].names
print(f"Total intents: {len(intents)}")
print(f"Sample intents: {intents[:10]}")
```

---

## Additional Resources

1. **HuggingFace Model Hub**: https://huggingface.co/models
2. **Papers With Code**: https://paperswithcode.com/
3. **Common Voice**: https://commonvoice.mozilla.org/
4. **AI4Bharat Indic NLP**: https://indicnlp.ai4bharat.org/
5. **Coqui TTS**: https://github.com/coqui-ai/TTS

---

## Next Steps

1. **Week 1-2**: Download and explore Banking77 dataset
2. **Week 3-4**: Fine-tune RoBERTa on Banking77
3. **Week 5-6**: Collect and annotate custom banking data
4. **Week 7-8**: Fine-tune Whisper on banking audio
5. **Week 9-10**: Deploy and test in staging environment
6. **Ongoing**: Collect real user data, iterate, improve

---

**Note**: Always ensure compliance with data privacy regulations (GDPR, CCPA, etc.) when collecting and using customer data for training.

