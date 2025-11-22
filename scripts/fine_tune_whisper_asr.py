"""
Fine-tune Whisper model on Common Voice dataset for ASR
"""
import os
import json
import pandas as pd
import torch
import numpy as np
from pathlib import Path
from typing import List, Dict, Optional
from datasets import Dataset, Audio
from transformers import (
    WhisperProcessor,
    WhisperForConditionalGeneration,
    WhisperTokenizer,
    Seq2SeqTrainingArguments,
    Seq2SeqTrainer,
    EarlyStoppingCallback
)
from transformers.trainer_utils import get_last_checkpoint
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Disable TensorFlow
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['TRANSFORMERS_NO_TF'] = '1'
os.environ['USE_TF'] = '0'

def load_common_voice_data(
    data_dir: str = "cv-corpus-22.0-delta-2025-06-20",
    language: str = "en",
    use_validated_only: bool = True,
    max_samples: Optional[int] = None
) -> Dataset:
    """
    Load Common Voice dataset
    
    Args:
        data_dir: Path to Common Voice dataset directory
        language: Language code (e.g., 'en', 'hi')
        use_validated_only: Only use validated audio clips
        max_samples: Maximum number of samples to load (None for all)
    
    Returns:
        Hugging Face Dataset with audio and text
    """
    logger.info(f"Loading Common Voice dataset from {data_dir}")
    
    # Path to validated.tsv
    validated_path = os.path.join(data_dir, language, "validated.tsv")
    clips_dir = os.path.join(data_dir, language, "clips")
    
    if not os.path.exists(validated_path):
        raise FileNotFoundError(f"Validated TSV not found: {validated_path}")
    if not os.path.exists(clips_dir):
        raise FileNotFoundError(f"Clips directory not found: {clips_dir}")
    
    # Load validated.tsv
    df = pd.read_csv(validated_path, sep="\t")
    logger.info(f"Loaded {len(df)} validated samples from TSV")
    
    # Filter for validated samples (up_votes > down_votes)
    if use_validated_only:
        df = df[df['up_votes'] > df['down_votes']]
        logger.info(f"Filtered to {len(df)} samples with up_votes > down_votes")
    
    # Limit samples if specified
    if max_samples and len(df) > max_samples:
        df = df.sample(n=max_samples, random_state=42)
        logger.info(f"Limited to {max_samples} samples")
    
    # Prepare data: path and sentence
    data = []
    for idx, row in df.iterrows():
        audio_path = os.path.join(clips_dir, row['path'])
        if os.path.exists(audio_path):
            data.append({
                'audio': audio_path,
                'text': str(row['sentence']).strip(),
                'path': row['path']
            })
        else:
            logger.warning(f"Audio file not found: {audio_path}")
    
    logger.info(f"[OK] Loaded {len(data)} valid audio-text pairs")
    
    # Create Hugging Face Dataset
    dataset = Dataset.from_list(data)
    
    # Load audio files
    dataset = dataset.cast_column("audio", Audio(sampling_rate=16000))
    
    return dataset


def prepare_dataset(
    dataset: Dataset,
    processor: WhisperProcessor,
    max_length: int = 448
) -> Dataset:
    """
    Prepare dataset for training
    
    Args:
        dataset: Input dataset
        processor: Whisper processor
        max_length: Maximum audio length in samples
    
    Returns:
        Processed dataset
    """
    def process_example(example):
        # Load audio
        audio = example["audio"]
        
        # Process audio
        inputs = processor(
            audio["array"],
            sampling_rate=audio["sampling_rate"],
            return_tensors="pt"
        )
        
        # Process text (tokenize)
        tokenizer = processor.tokenizer
        labels = tokenizer(
            example["text"],
            return_tensors="pt",
            padding="max_length",
            truncation=True,
            max_length=448
        ).input_ids
        
        # Extract labels - ensure they're numpy array first
        if isinstance(labels, torch.Tensor):
            labels_array = labels[0].cpu().numpy().astype(np.int64)
        else:
            labels_array = np.array(labels[0], dtype=np.int64)
        
        # Replace padding token id's of the labels by -100 so it's ignored by the loss function
        labels_array[labels_array == tokenizer.pad_token_id] = -100
        
        # Convert back to tensor with explicit long dtype
        labels_tensor = torch.from_numpy(labels_array).long()
        
        # Ensure input_features is a tensor
        input_features = inputs.input_features[0]
        if not isinstance(input_features, torch.Tensor):
            input_features = torch.tensor(input_features, dtype=torch.float32)
        
        return {
            "input_features": input_features,
            "labels": labels_tensor
        }
    
    dataset = dataset.map(
        process_example,
        remove_columns=dataset.column_names,
        num_proc=1  # Set to 1 for Windows compatibility
    )
    
    return dataset


def compute_metrics(pred, processor):
    """Compute WER (Word Error Rate) and CER (Character Error Rate)"""
    import numpy as np
    from jiwer import wer, cer
    
    pred_ids = pred.predictions
    label_ids = pred.label_ids
    
    # Replace -100 with pad_token_id
    label_ids[label_ids == -100] = processor.tokenizer.pad_token_id
    
    # Decode predictions and labels
    pred_str = processor.batch_decode(pred_ids, skip_special_tokens=True)
    label_str = processor.batch_decode(label_ids, skip_special_tokens=True)
    
    # Compute metrics
    wer_score = wer(label_str, pred_str)
    cer_score = cer(label_str, pred_str)
    
    return {
        "wer": wer_score,
        "cer": cer_score
    }


def fine_tune_whisper(
    model_name: str = "openai/whisper-tiny",
    data_dir: str = "cv-corpus-22.0-delta-2025-06-20",
    language: str = "en",
    output_dir: str = "./models/whisper-asr",
    num_epochs: int = 3,
    batch_size: int = 16,
    learning_rate: float = 1e-5,
    max_samples: Optional[int] = None,
    use_validated_only: bool = True
):
    """
    Fine-tune Whisper model on Common Voice dataset
    
    Args:
        model_name: Base Whisper model name
        data_dir: Path to Common Voice dataset
        language: Language code
        output_dir: Output directory for trained model
        num_epochs: Number of training epochs
        batch_size: Training batch size
        learning_rate: Learning rate
        max_samples: Maximum samples to use (None for all)
        use_validated_only: Only use validated audio
    """
    
    logger.info("=" * 70)
    logger.info("Whisper ASR Fine-tuning")
    logger.info("=" * 70)
    
    # Check for GPU
    device = "cuda" if torch.cuda.is_available() else "cpu"
    logger.info(f"Using device: {device}")
    if torch.cuda.is_available():
        logger.info(f"GPU: {torch.cuda.get_device_name(0)}")
        logger.info(f"GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
    
    # Load processor and model
    logger.info(f"Loading model: {model_name}")
    processor = WhisperProcessor.from_pretrained(model_name)
    model = WhisperForConditionalGeneration.from_pretrained(model_name)
    
    # Set language and task tokens
    model.config.forced_decoder_ids = processor.get_decoder_prompt_ids(
        language=language,
        task="transcribe"
    )
    
    # Load dataset
    logger.info("Loading Common Voice dataset...")
    dataset = load_common_voice_data(
        data_dir=data_dir,
        language=language,
        use_validated_only=use_validated_only,
        max_samples=max_samples
    )
    
    # Split into train/validation (90/10)
    dataset = dataset.train_test_split(test_size=0.1, seed=42)
    train_dataset = dataset["train"]
    eval_dataset = dataset["test"]
    
    logger.info(f"Train samples: {len(train_dataset)}")
    logger.info(f"Validation samples: {len(eval_dataset)}")
    
    # Prepare datasets
    logger.info("Preparing datasets...")
    train_dataset = prepare_dataset(train_dataset, processor)
    eval_dataset = prepare_dataset(eval_dataset, processor)
    
    # Training arguments
    training_args = Seq2SeqTrainingArguments(
        output_dir=output_dir,
        num_train_epochs=num_epochs,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        learning_rate=learning_rate,
        warmup_steps=500,
        gradient_accumulation_steps=2,
        fp16=torch.cuda.is_available(),
        evaluation_strategy="epoch",
        save_strategy="epoch",
        logging_steps=100,
        load_best_model_at_end=True,
        metric_for_best_model="wer",
        greater_is_better=False,
        save_total_limit=3,
        predict_with_generate=True,
        dataloader_num_workers=0,  # Windows compatibility
        report_to=[],  # Disable logging integrations
        logging_dir=None,
    )
    
    # Create custom data collator for Whisper (handles input_features instead of input_ids)
    def data_collator_fn(features):
        batch = {}
        # Stack input_features - convert to tensor if needed
        input_features_list = []
        for f in features:
            feat = f["input_features"]
            if isinstance(feat, torch.Tensor):
                input_features_list.append(feat)
            elif isinstance(feat, (list, np.ndarray)):
                input_features_list.append(torch.tensor(feat, dtype=torch.float32))
            else:
                input_features_list.append(torch.tensor(feat, dtype=torch.float32))
        batch["input_features"] = torch.stack(input_features_list)
        
        # Stack labels and ensure long dtype
        labels_list = []
        for f in features:
            label = f["labels"]
            if isinstance(label, torch.Tensor):
                labels_list.append(label.long())
            else:
                labels_list.append(torch.tensor(label, dtype=torch.long))
        batch["labels"] = torch.stack(labels_list)
        return batch
    
    # Create compute_metrics function with processor (closure)
    processor_ref = processor  # Capture processor in closure
    def compute_metrics_wrapper(pred):
        return compute_metrics(pred, processor_ref)
    
    # Initialize trainer
    trainer = Seq2SeqTrainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=eval_dataset,
        tokenizer=processor.feature_extractor,
        data_collator=data_collator_fn,
        compute_metrics=compute_metrics_wrapper,
        callbacks=[EarlyStoppingCallback(early_stopping_patience=3)]
    )
    
    # Train
    logger.info("Starting training...")
    checkpoint = get_last_checkpoint(output_dir)
    if checkpoint:
        logger.info(f"Resuming from checkpoint: {checkpoint}")
        trainer.train(resume_from_checkpoint=checkpoint)
    else:
        trainer.train()
    
    # Evaluate
    logger.info("Evaluating model...")
    eval_results = trainer.evaluate()
    
    logger.info("=" * 70)
    logger.info("Training Complete!")
    logger.info("=" * 70)
    logger.info(f"Final WER: {eval_results.get('eval_wer', 'N/A')}")
    logger.info(f"Final CER: {eval_results.get('eval_cer', 'N/A')}")
    
    # Save model
    logger.info(f"Saving model to {output_dir}...")
    trainer.save_model()
    processor.save_pretrained(output_dir)
    
    # Save training info
    training_info = {
        "model_name": model_name,
        "language": language,
        "num_epochs": num_epochs,
        "batch_size": batch_size,
        "learning_rate": learning_rate,
        "train_samples": len(train_dataset),
        "eval_samples": len(eval_dataset),
        "eval_results": eval_results
    }
    
    with open(os.path.join(output_dir, "training_info.json"), "w") as f:
        json.dump(training_info, f, indent=2)
    
    logger.info("[OK] Model saved successfully!")
    
    return trainer, eval_results


def main():
    """Main function"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Fine-tune Whisper ASR model")
    parser.add_argument(
        "--model",
        type=str,
        default="openai/whisper-tiny",
        help="Base Whisper model (default: openai/whisper-tiny)"
    )
    parser.add_argument(
        "--data-dir",
        type=str,
        default="cv-corpus-22.0-delta-2025-06-20",
        help="Path to Common Voice dataset"
    )
    parser.add_argument(
        "--language",
        type=str,
        default="en",
        help="Language code (default: en)"
    )
    parser.add_argument(
        "--output",
        type=str,
        default="./models/whisper-asr",
        help="Output directory (default: ./models/whisper-asr)"
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=3,
        help="Number of epochs (default: 3)"
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
        default=1e-5,
        help="Learning rate (default: 1e-5)"
    )
    parser.add_argument(
        "--max-samples",
        type=int,
        default=None,
        help="Maximum samples to use (default: all)"
    )
    
    args = parser.parse_args()
    
    # Create output directory
    os.makedirs(args.output, exist_ok=True)
    
    # Fine-tune model
    trainer, results = fine_tune_whisper(
        model_name=args.model,
        data_dir=args.data_dir,
        language=args.language,
        output_dir=args.output,
        num_epochs=args.epochs,
        batch_size=args.batch_size,
        learning_rate=args.lr,
        max_samples=args.max_samples,
        use_validated_only=True
    )
    
    print("\n" + "="*60)
    print("Training Complete!")
    print("="*60)
    print(f"\nModel saved to: {args.output}")
    print("You can now use this model for ASR in production.")


if __name__ == "__main__":
    main()

