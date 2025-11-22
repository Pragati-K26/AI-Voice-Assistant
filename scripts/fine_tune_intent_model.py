"""
Script to fine-tune a BERT-based model on Banking77 dataset for intent recognition
"""
import os
import json
import pandas as pd

# Disable TensorFlow to avoid DLL issues (we're using PyTorch)
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TRANSFORMERS_NO_TF'] = '1'
os.environ['USE_TF'] = '0'

# Prevent TensorFlow imports
import sys
if 'tensorflow' in sys.modules:
    del sys.modules['tensorflow']

from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
    EarlyStoppingCallback
)
from datasets import Dataset, load_dataset
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import numpy as np


def load_banking77_data(data_dir="banking77data"):
    """Load Banking77 dataset from CSV files"""
    print("Loading Banking77 dataset...")
    
    # Try multiple possible locations
    possible_paths = [
        os.path.join(data_dir, "banking77_train.csv"),
        os.path.join("..", data_dir, "banking77_train.csv"),
        os.path.join(".", data_dir, "banking77_train.csv"),
        "data/banking77/train.csv",
    ]
    
    train_path = None
    test_path = None
    
    for path in possible_paths:
        if os.path.exists(path):
            train_path = path
            test_path = path.replace("train.csv", "test.csv")
            break
    
    if train_path and os.path.exists(train_path) and os.path.exists(test_path):
        train_df = pd.read_csv(train_path)
        test_df = pd.read_csv(test_path)
        
        print(f"[OK] Loaded from: {train_path}")
        
        # Ensure we have the right columns
        if 'label' not in train_df.columns and 'label_text' in train_df.columns:
            # Create label mapping from label_text
            unique_labels = sorted(train_df['label_text'].unique())
            label_map = {label: idx for idx, label in enumerate(unique_labels)}
            train_df['label'] = train_df['label_text'].map(label_map)
            test_df['label'] = test_df['label_text'].map(label_map)
            
            # Save label mapping
            os.makedirs(os.path.dirname(train_path) or ".", exist_ok=True)
            mapping_path = os.path.join(os.path.dirname(train_path) or ".", "label_mapping.json")
            with open(mapping_path, "w") as f:
                json.dump({v: k for k, v in label_map.items()}, f, indent=2)
            print(f"[OK] Created label mapping: {mapping_path}")
        
        # Convert to HuggingFace Dataset
        train_dataset = Dataset.from_pandas(train_df)
        test_dataset = Dataset.from_pandas(test_df)
        
        print(f"[OK] Loaded from local files")
    else:
        # Download if not exists
        print("Local files not found, downloading from HuggingFace...")
        dataset = load_dataset("banking77")
        train_dataset = dataset['train']
        test_dataset = dataset['test']
        print(f"[OK] Downloaded from HuggingFace")
    
    print(f"  - Training samples: {len(train_dataset)}")
    print(f"  - Test samples: {len(test_dataset)}")
    
    # Get unique labels
    if 'label' in train_dataset.column_names:
        num_labels = len(set(train_dataset['label']))
    elif 'label_text' in train_dataset.column_names:
        num_labels = len(set(train_dataset['label_text']))
    else:
        raise ValueError("No label column found in dataset")
    
    print(f"  - Number of intents: {num_labels}")
    
    return train_dataset, test_dataset


def preprocess_function(examples, tokenizer, max_length=128):
    """Tokenize examples"""
    # Handle both 'text' and 'sentence' column names
    text_column = "text" if "text" in examples else "sentence"
    texts = examples[text_column] if isinstance(examples[text_column], list) else [examples[text_column]]
    
    return tokenizer(
        texts,
        truncation=True,
        padding="max_length",
        max_length=max_length,
    )


def compute_metrics(eval_pred):
    """Compute evaluation metrics"""
    predictions, labels = eval_pred
    predictions = np.argmax(predictions, axis=1)
    
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, predictions, average='weighted'
    )
    accuracy = accuracy_score(labels, predictions)
    
    return {
        'accuracy': accuracy,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }


def fine_tune_model(
    model_name="roberta-base",
    output_dir="./models/banking77-intent",
    num_epochs=5,
    batch_size=16,
    learning_rate=2e-5,
    train_size=0.9
):
    """Fine-tune model on Banking77"""
    
    print(f"\n{'='*60}")
    print(f"Fine-tuning {model_name} on Banking77")
    print(f"{'='*60}\n")
    
    # Load datasets
    train_dataset, test_dataset = load_banking77_data()
    
    # Get number of labels
    if 'label' in train_dataset.column_names:
        num_labels = len(set(train_dataset['label']))
    elif 'label_text' in train_dataset.column_names:
        unique_labels = set(train_dataset['label_text'])
        num_labels = len(unique_labels)
        # Create label mapping if needed
        label_map = {label: idx for idx, label in enumerate(sorted(unique_labels))}
        train_dataset = train_dataset.map(lambda x: {"label": label_map[x['label_text']]})
        test_dataset = test_dataset.map(lambda x: {"label": label_map[x['label_text']]})
    else:
        raise ValueError("No label information found in dataset")
    
    print(f"Number of intents: {num_labels}\n")
    
    # Load tokenizer and model
    print(f"Loading {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=num_labels
    )
    print("[OK] Model loaded\n")
    
    # Tokenize datasets
    print("Tokenizing datasets...")
    # Keep label column
    columns_to_remove = [col for col in train_dataset.column_names if col not in ['label', 'text', 'sentence']]
    
    train_dataset = train_dataset.map(
        lambda x: preprocess_function(x, tokenizer),
        batched=True,
        remove_columns=columns_to_remove
    )
    test_dataset = test_dataset.map(
        lambda x: preprocess_function(x, tokenizer),
        batched=True,
        remove_columns=columns_to_remove
    )
    print("[OK] Tokenization complete\n")
    
    # Check for GPU
    import torch
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    
    # Training arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        learning_rate=learning_rate,
        weight_decay=0.01,
        warmup_steps=500,
        logging_dir=f"{output_dir}/logs",
        logging_steps=100,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        save_total_limit=3,
        fp16=torch.cuda.is_available(),  # Enable mixed precision if GPU available
        dataloader_num_workers=0,  # Set to 0 for Windows compatibility
    )
    
    # Initialize trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        compute_metrics=compute_metrics,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
    )
    
    # Train
    print("Starting training...\n")
    trainer.train()
    
    # Evaluate
    print("\nEvaluating on test set...")
    eval_results = trainer.evaluate()
    
    print(f"\n{'='*60}")
    print("Training Results")
    print(f"{'='*60}")
    print(f"Test Accuracy: {eval_results['eval_accuracy']:.4f}")
    print(f"Test F1 Score: {eval_results['eval_f1']:.4f}")
    print(f"Test Precision: {eval_results['eval_precision']:.4f}")
    print(f"Test Recall: {eval_results['eval_recall']:.4f}")
    print(f"{'='*60}\n")
    
    # Save model
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    
    print(f"[OK] Model saved to: {output_dir}")
    
    # Save label mapping
    try:
        # Try to get label mapping from original dataset
        train_dataset_original, _ = load_banking77_data()
        
        if 'label_text' in train_dataset_original.column_names:
            # Get unique label_text to label index mapping
            label_map = {}
            seen_labels = set()
            
            for sample in train_dataset_original:
                label_text = sample.get('label_text')
                label_idx = sample.get('label')
                
                if label_text and label_idx is not None and label_text not in seen_labels:
                    label_map[int(label_idx)] = label_text
                    seen_labels.add(label_text)
            
            if label_map:
                mapping_path = os.path.join(output_dir, "label_mapping.json")
                with open(mapping_path, "w") as f:
                    json.dump(label_map, f, indent=2)
                print(f"[OK] Label mapping saved: {mapping_path}")
    except Exception as e:
        print(f"Warning: Could not save label mapping: {e}")
    
    # Create and save intent mapping
    try:
        import sys
        sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
        from create_intent_mapping import create_intent_mapping
        mapping_path = os.path.join(output_dir, "intent_mapping.json")
        create_intent_mapping(output_path=mapping_path)
        print(f"[OK] Intent mapping saved: {mapping_path}")
    except Exception as e:
        print(f"Warning: Could not create intent mapping: {e}")
        print("You can create it manually by running: python scripts/create_intent_mapping.py")
    
    # Save training info
    info = {
        "model_name": model_name,
        "num_labels": num_labels,
        "num_epochs": num_epochs,
        "batch_size": batch_size,
        "learning_rate": learning_rate,
        "eval_results": eval_results
    }
    
    with open(f"{output_dir}/training_info.json", "w") as f:
        json.dump(info, f, indent=2)
    
    print(f"[OK] Training info saved: {output_dir}/training_info.json")
    
    return trainer, eval_results


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Fine-tune intent recognition model")
    parser.add_argument(
        "--model",
        type=str,
        default="roberta-base",
        help="Base model name (default: roberta-base)"
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=5,
        help="Number of training epochs (default: 5)"
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=16,
        help="Batch size (default: 16)"
    )
    parser.add_argument(
        "--lr",
        type=float,
        default=2e-5,
        help="Learning rate (default: 2e-5)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="./models/banking77-intent",
        help="Output directory (default: ./models/banking77-intent)"
    )
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output, exist_ok=True)
    
    # Fine-tune model
    trainer, results = fine_tune_model(
        model_name=args.model,
        output_dir=args.output,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr
    )
    
    print("\n" + "="*60)
    print("Training Complete!")
    print("="*60)
    print(f"\nModel saved to: {args.output}")
    print("You can now use this model for intent recognition in production.")


if __name__ == "__main__":
    main()

