"""
Complete script to train Banking77 model and integrate with the application
"""
import os
import sys
import subprocess

def main():
    print("=" * 70)
    print("Banking77 Model Training and Integration")
    print("=" * 70)
    
    # Step 1: Create intent mapping
    print("\n[Step 1/4] Creating intent mapping...")
    try:
        from create_intent_mapping import create_intent_mapping
        create_intent_mapping()
        print("✓ Intent mapping created")
    except Exception as e:
        print(f"✗ Error creating intent mapping: {e}")
        return
    
    # Step 2: Train the model
    print("\n[Step 2/4] Training Banking77 model...")
    print("This may take a while depending on your hardware...")
    
    # Use smaller model for faster training (can be changed)
    model_name = "distilbert-base-uncased"  # Faster, smaller
    # model_name = "roberta-base"  # Better accuracy, slower
    
    epochs = 3  # Start with 3 epochs, can increase
    batch_size = 16
    
    try:
        from fine_tune_intent_model import fine_tune_model
        trainer, results = fine_tune_model(
            model_name=model_name,
            output_dir="./models/banking77-intent",
            num_epochs=epochs,
            batch_size=batch_size,
            learning_rate=2e-5
        )
        print("✓ Model training completed")
        print(f"  - Test Accuracy: {results['eval_accuracy']:.4f}")
        print(f"  - Test F1 Score: {results['eval_f1']:.4f}")
    except Exception as e:
        print(f"✗ Error training model: {e}")
        print("Make sure you have:")
        print("  - transformers library installed: pip install transformers")
        print("  - datasets library installed: pip install datasets")
        print("  - torch installed: pip install torch")
        return
    
    # Step 3: Copy intent mapping to model directory
    print("\n[Step 3/4] Copying intent mapping to model directory...")
    try:
        import shutil
        if os.path.exists("banking77data/intent_mapping.json"):
            shutil.copy(
                "banking77data/intent_mapping.json",
                "models/banking77-intent/intent_mapping.json"
            )
            print("✓ Intent mapping copied to model directory")
        else:
            print("⚠ Intent mapping file not found, but model will work with fallback mapping")
    except Exception as e:
        print(f"⚠ Warning: Could not copy intent mapping: {e}")
    
    # Step 4: Verify integration
    print("\n[Step 4/4] Verifying model integration...")
    try:
        # Test loading the model
        from transformers import AutoTokenizer, AutoModelForSequenceClassification
        model_path = "./models/banking77-intent"
        
        if os.path.exists(os.path.join(model_path, "config.json")):
            tokenizer = AutoTokenizer.from_pretrained(model_path)
            model = AutoModelForSequenceClassification.from_pretrained(model_path)
            print("✓ Model can be loaded successfully")
            
            # Test inference
            test_text = "What is my account balance?"
            inputs = tokenizer(test_text, return_tensors="pt", truncation=True, max_length=128)
            outputs = model(**inputs)
            print(f"✓ Test inference successful for: '{test_text}'")
        else:
            print("✗ Model files not found")
            return
    except Exception as e:
        print(f"⚠ Warning: Could not verify model: {e}")
        print("The model may still work, but verification failed")
    
    print("\n" + "=" * 70)
    print("Training and Integration Complete!")
    print("=" * 70)
    print("\nNext steps:")
    print("1. Restart your backend server to load the new model")
    print("2. Test intent recognition with voice commands")
    print("3. Monitor logs to see if Banking77 model is being used")
    print("\nModel location: ./models/banking77-intent/")
    print("\nThe intent recognition service will automatically:")
    print("  - Try to load the Banking77 model first")
    print("  - Fall back to base model if not found")
    print("  - Use rule-based recognition if models fail")

if __name__ == "__main__":
    main()





