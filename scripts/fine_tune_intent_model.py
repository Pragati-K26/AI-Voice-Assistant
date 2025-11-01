"""
Script to fine-tune a BERT-based model on Banking77 dataset for intent recognition
"""
import os
import json
import pandas as pd
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


def load_banking77_data():
    """Load Banking77 dataset"""
    print("Loading Banking77 dataset...")
    
    if os.path.exists("data/banking77/train.csv"):
        train_df = pd.read_csv("data/banking77/train.csv")
        test_df = pd.read_csv("data/banking77/test.csv")
        
        # Convert to HuggingFace Dataset
        train_dataset = Dataset.from_pandas(train_df)
        test_dataset = Dataset.from_pandas(test_df)
        
        print(f"✓ Loaded from local files")
    else:
        # Download if not exists
        dataset = load_dataset("banking77")
        train_dataset = dataset['train']
        test_dataset = dataset['test']
        print(f"✓ Downloaded from HuggingFace")
    
    print(f"  - Training samples: {len(train_dataset)}")
    print(f"  - Test samples: {len(test_dataset)}")
    
    return train_dataset, test_dataset


def preprocess_function(examples, tokenizer, max_length=128):
    """Tokenize examples"""
    return tokenizer(
        examples["text"],
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
    num_labels = len(set(train_dataset['label']))
    print(f"Number of intents: {num_labels}\n")
    
    # Load tokenizer and model
    print(f"Loading {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSequenceClassification.from_pretrained(
        model_name,
        num_labels=num_labels
    )
    print("✓ Model loaded\n")
    
    # Tokenize datasets
    print("Tokenizing datasets...")
    train_dataset = train_dataset.map(
        lambda x: preprocess_function(x, tokenizer),
        batched=True,
        remove_columns=train_dataset.column_names
    )
    test_dataset = test_dataset.map(
        lambda x: preprocess_function(x, tokenizer),
        batched=True,
        remove_columns=test_dataset.column_names
    )
    print("✓ Tokenization complete\n")
    
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
        fp16=True,  # Enable mixed precision if GPU available
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
    
    print(f"✓ Model saved to: {output_dir}")
    
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

