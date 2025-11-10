# Banking77 Model Training Guide

This guide explains how to train the Banking77 intent recognition model and integrate it with the voice banking assistant.

## Overview

The Banking77 dataset contains 77 banking-related intents with 10,000 training examples. We fine-tune a BERT-based model on this dataset to improve intent recognition accuracy for banking operations.

## Prerequisites

1. **Python Dependencies** (already in requirements.txt):
   ```bash
   pip install transformers datasets torch scikit-learn
   ```

2. **Dataset**: The Banking77 dataset files should be in `banking77data/`:
   - `banking77_train.csv`
   - `banking77_test.csv`

## Quick Start

### Option 1: Automated Training (Recommended)

Run the complete training and integration script:

```bash
cd scripts
python train_and_integrate.py
```

This will:
1. Create intent mapping from Banking77 to application intents
2. Train the model on Banking77 dataset
3. Save the model and mappings
4. Verify the integration

### Option 2: Manual Training

#### Step 1: Create Intent Mapping

```bash
cd scripts
python create_intent_mapping.py
```

This creates `banking77data/intent_mapping.json` that maps Banking77 intents to your application's intents.

#### Step 2: Train the Model

```bash
cd scripts
python fine_tune_intent_model.py --model distilbert-base-uncased --epochs 3 --batch-size 16
```

**Parameters:**
- `--model`: Base model to use (default: `distilbert-base-uncased`)
  - `distilbert-base-uncased`: Faster, smaller, good for CPU
  - `roberta-base`: Better accuracy, slower, better for GPU
- `--epochs`: Number of training epochs (default: 5, recommended: 3-5)
- `--batch-size`: Batch size (default: 16, adjust based on GPU memory)
- `--lr`: Learning rate (default: 2e-5)
- `--output`: Output directory (default: `./models/banking77-intent`)

#### Step 3: Verify Model

The trained model will be saved to `./models/banking77-intent/` with:
- `config.json`: Model configuration
- `pytorch_model.bin`: Model weights
- `tokenizer_config.json`: Tokenizer configuration
- `label_mapping.json`: Label index to label text mapping
- `intent_mapping.json`: Banking77 intent to application intent mapping
- `training_info.json`: Training metrics and settings

## Model Integration

The intent recognition service automatically:

1. **Tries to load the Banking77 model first** from:
   - `./models/banking77-intent`
   - `../models/banking77-intent`
   - `models/banking77-intent`
   - Relative to backend directory

2. **Falls back to base model** if Banking77 model not found

3. **Uses rule-based recognition** if models fail to load

## Testing the Model

After training, restart your backend server:

```bash
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Check the logs to see:
```
INFO: Loading fine-tuned Banking77 model from: ./models/banking77-intent
INFO: ✓ Fine-tuned Banking77 model loaded successfully
INFO: Loaded intent mapping with XX mappings
```

## Expected Performance

With Banking77 fine-tuning, you should see:
- **Accuracy**: ~90-95% on test set
- **F1 Score**: ~0.90-0.95
- **Better intent recognition** for banking-specific queries

## Model Architecture

- **Base Model**: DistilBERT (faster) or RoBERTa (more accurate)
- **Task**: Sequence Classification (77 intents)
- **Input**: User text query (max 512 tokens)
- **Output**: Intent class with confidence score

## Intent Mapping

Banking77 has 77 intents. The mapping script automatically maps them to your application's 18 intents:

- Balance queries → `check_balance`
- Transfer queries → `transfer_funds`
- Transaction history → `view_transactions`
- Loan queries → `loan_inquiry`
- Interest queries → `interest_inquiry`
- Credit card queries → `credit_limit_inquiry` or `manage_card`
- Payment queries → `payment_alert`
- Spending queries → `spending_summary`
- Notification queries → `view_notifications`
- Reminder queries → `set_reminder`
- Others → `other`

## Customization

### Adjust Training Parameters

Edit `scripts/fine_tune_intent_model.py` or use command-line arguments:

```bash
python fine_tune_intent_model.py \
    --model roberta-base \
    --epochs 5 \
    --batch-size 32 \
    --lr 3e-5
```

### Modify Intent Mapping

Edit `scripts/create_intent_mapping.py` to customize how Banking77 intents map to your application intents.

### Add More Training Data

You can combine Banking77 with your own data:
1. Format your data as CSV with `text` and `label` columns
2. Merge with Banking77 dataset
3. Retrain the model

## Troubleshooting

### Model Not Loading

1. Check that model directory exists: `./models/banking77-intent/`
2. Verify `config.json` exists in model directory
3. Check backend logs for specific error messages

### Low Accuracy

1. Train for more epochs: `--epochs 5`
2. Use larger model: `--model roberta-base`
3. Increase batch size (if GPU available)
4. Adjust learning rate: `--lr 3e-5`

### Memory Issues

1. Reduce batch size: `--batch-size 8`
2. Use smaller model: `--model distilbert-base-uncased`
3. Reduce max_length in tokenization (edit script)

## Files Created

After training, you'll have:

```
models/
└── banking77-intent/
    ├── config.json
    ├── pytorch_model.bin
    ├── tokenizer_config.json
    ├── vocab.txt
    ├── label_mapping.json
    ├── intent_mapping.json
    └── training_info.json

banking77data/
├── banking77_train.csv
├── banking77_test.csv
└── intent_mapping.json
```

## Next Steps

1. **Monitor Performance**: Check intent recognition accuracy in production
2. **Collect Feedback**: Gather user queries that are misclassified
3. **Retrain**: Periodically retrain with new data to improve accuracy
4. **Fine-tune Mapping**: Adjust intent mapping based on real-world usage

## References

- [Banking77 Dataset](https://huggingface.co/datasets/banking77)
- [Transformers Documentation](https://huggingface.co/docs/transformers)
- [Fine-tuning Guide](https://huggingface.co/docs/transformers/training)





