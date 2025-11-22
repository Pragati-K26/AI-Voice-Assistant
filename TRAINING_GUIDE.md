# Training Guide: Fine-tuning Models for Production

This guide walks you through training and fine-tuning models for the AI Voice Banking Assistant.

## Prerequisites

```bash
# Install required packages
pip install transformers datasets scikit-learn torch torchaudio
pip install accelerate  # For faster training
pip install wandb  # Optional: for experiment tracking
```

## Quick Start

### 1. Download Datasets

```bash
cd scripts
python download_datasets.py
```

This will:
- Download Banking77 dataset
- Create custom data collection template
- Organize data in `data/` directory

### 2. Fine-tune Intent Recognition Model

```bash
# Basic training
python scripts/fine_tune_intent_model.py

# Custom parameters
python scripts/fine_tune_intent_model.py \
    --model roberta-base \
    --epochs 5 \
    --batch-size 16 \
    --lr 2e-5 \
    --output ./models/banking77-intent
```

### 3. Use Fine-tuned Model

Update `backend/app/core/config.py`:

```python
INTENT_MODEL_PATH = "models/banking77-intent"  # Path to your fine-tuned model
```

## Detailed Training Steps

### Step 1: Prepare Your Data

#### Using Banking77 Dataset

The Banking77 dataset is automatically downloaded and prepared. It contains:
- 13,083 training samples
- 77 banking intents
- Ready-to-use format

#### Collecting Custom Data

1. Use the template in `data/custom/collected_data.csv`
2. Add your real banking queries
3. Label with correct intents
4. Include entity annotations if needed

Example:
```csv
text,intent,entities
"Check my account balance","check_balance","{}"
"Transfer ₹5000 to Akash","transfer_funds","{'amount': '5000', 'recipient': 'Akash'}"
```

### Step 2: Fine-tune Intent Model

#### Option A: Using the Script

```bash
python scripts/fine_tune_intent_model.py \
    --model distilbert-base-uncased \  # Faster, smaller
    --epochs 3 \
    --batch-size 32 \
    --lr 2e-5
```

#### Option B: Manual Training

See `scripts/fine_tune_intent_model.py` for the full implementation.

### Step 3: Evaluate Model

After training, check:
- Test accuracy (should be > 90%)
- F1 score per intent class
- Confusion matrix for misclassifications

### Step 4: Deploy Model

1. Copy model to production:
```bash
cp -r models/banking77-intent /path/to/production/models/
```

2. Update backend config:
```python
INTENT_MODEL_PATH = "/path/to/production/models/banking77-intent"
```

3. Restart backend server

## Advanced Training

### Multi-language Support

For Indian languages:
```python
# Use IndicBERT
model_name = "ai4bharat/indic-bert"
```

### Transfer Learning from FinBERT

```python
# Start with FinBERT
model_name = "yiyanghkust/finbert-tone"
# Then fine-tune on Banking77
```

### Data Augmentation

Increase dataset size:
```python
from parrot import Parrot
import torch

parrot = Parrot(model_tag="prithivida/parrot_paraphraser_on_T5")

def augment_text(text):
    phrases = parrot.augment(input_phrase=text)
    return phrases[0][0] if phrases else text
```

## Hyperparameter Tuning

### Recommended Settings

| Model | Batch Size | Learning Rate | Epochs | Expected F1 |
|-------|-----------|---------------|--------|-------------|
| DistilBERT | 32 | 2e-5 | 3-5 | 0.92-0.94 |
| RoBERTa-base | 16 | 2e-5 | 5 | 0.94-0.96 |
| RoBERTa-large | 8 | 1e-5 | 3 | 0.96-0.97 |

### Learning Rate Schedule

```python
training_args = TrainingArguments(
    learning_rate=2e-5,
    warmup_steps=500,
    lr_scheduler_type="linear",  # or "cosine"
)
```

## Monitoring Training

### Using Weights & Biases

```bash
pip install wandb
wandb login

# Training will automatically log to W&B
python scripts/fine_tune_intent_model.py
```

### Using TensorBoard

```bash
tensorboard --logdir models/banking77-intent/logs
```

## Production Deployment

### 1. Model Optimization

#### Quantization (Reduce Size)
```python
from transformers import AutoModelForSequenceClassification
import torch

model = AutoModelForSequenceClassification.from_pretrained("models/banking77-intent")

# 8-bit quantization
model = torch.quantization.quantize_dynamic(
    model, {torch.nn.Linear}, dtype=torch.qint8
)
```

#### ONNX Export (Faster Inference)
```python
from transformers.convert_graph_to_onnx import convert

convert(
    framework="pt",
    model="models/banking77-intent",
    output="models/banking77-intent.onnx",
    opset=12
)
```

### 2. Model Serving

#### Option A: HuggingFace Inference API
```python
from transformers import pipeline

classifier = pipeline(
    "text-classification",
    model="models/banking77-intent",
    device=0  # GPU
)
```

#### Option B: FastAPI Endpoint
```python
@app.post("/predict-intent")
async def predict_intent(text: str):
    inputs = tokenizer(text, return_tensors="pt")
    outputs = model(**inputs)
    predicted_class = outputs.logits.argmax().item()
    intent = intent_mapping[predicted_class]
    return {"intent": intent, "confidence": outputs.logits.softmax(dim=1).max().item()}
```

## Continuous Improvement

### 1. Collect Real User Data

- Log all user queries
- Label misclassifications
- Add to training data
- Re-train periodically

### 2. A/B Testing

- Deploy multiple model versions
- Compare performance
- Gradually shift traffic to better model

### 3. Monitoring

Track in production:
- Intent accuracy
- Confidence scores
- Misclassification patterns
- User feedback

## Troubleshooting

### Low Accuracy

1. **Check data quality**: Ensure correct labels
2. **Increase training data**: More examples per intent
3. **Adjust learning rate**: Try 1e-5 or 5e-5
4. **Train longer**: More epochs
5. **Use larger model**: RoBERTa-large instead of base

### Overfitting

1. **Add regularization**: weight_decay=0.01
2. **Early stopping**: Stop when validation F1 stops improving
3. **More data**: Collect more training examples
4. **Dropout**: Increase dropout rate in model

### Slow Training

1. **Reduce batch size**: But increase gradient accumulation
2. **Use mixed precision**: fp16=True
3. **Use GPU**: Ensure CUDA available
4. **Smaller model**: DistilBERT instead of RoBERTa

## Next Steps

1. **Week 1**: Download datasets, run baseline training
2. **Week 2**: Collect custom banking data
3. **Week 3**: Fine-tune on combined dataset
4. **Week 4**: Deploy to staging, collect feedback
5. **Ongoing**: Continuous improvement cycle

For more details, see `MODELS_AND_DATASETS.md`.

