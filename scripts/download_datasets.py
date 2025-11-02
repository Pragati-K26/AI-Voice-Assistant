"""
Script to download and prepare banking datasets for training
"""
import os
from datasets import load_dataset
import pandas as pd
import json

def download_banking77():
    """Download and prepare Banking77 dataset"""
    print("Downloading Banking77 dataset...")
    
    try:
        dataset = load_dataset("banking77")
        
        # Create output directory
        os.makedirs("data/banking77", exist_ok=True)
        
        # Convert to DataFrames
        df_train = pd.DataFrame(dataset['train'])
        df_test = pd.DataFrame(dataset['test'])
        
        # Save as CSV
        df_train.to_csv("data/banking77/train.csv", index=False)
        df_test.to_csv("data/banking77/test.csv", index=False)
        
        # Get intent labels
        intents = dataset['train'].features['label'].names
        intent_mapping = {i: intent for i, intent in enumerate(intents)}
        
        # Save intent mapping
        with open("data/banking77/intent_mapping.json", "w") as f:
            json.dump(intent_mapping, f, indent=2)
        
        print(f"✓ Banking77 downloaded successfully!")
        print(f"  - Training samples: {len(df_train)}")
        print(f"  - Test samples: {len(df_test)}")
        print(f"  - Number of intents: {len(intents)}")
        print(f"  - Saved to: data/banking77/")
        
        # Show sample intents
        print(f"\n  Sample intents:")
        for i, intent in enumerate(intents[:10]):
            print(f"    {i}: {intent}")
        
        return dataset
        
    except Exception as e:
        print(f"✗ Error downloading Banking77: {e}")
        print("  Make sure you have 'datasets' library installed: pip install datasets")
        return None


def download_common_voice(language="en"):
    """Download CommonVoice dataset for speech training"""
    print(f"\nDownloading CommonVoice dataset (language: {language})...")
    
    try:
        dataset = load_dataset("mozilla-foundation/common_voice_13_0", language, split="train[:10%]")
        
        os.makedirs("data/common_voice", exist_ok=True)
        
        print(f"✓ CommonVoice downloaded successfully!")
        print(f"  - Samples: {len(dataset)}")
        print(f"  - Language: {language}")
        
        return dataset
        
    except Exception as e:
        print(f"✗ Error downloading CommonVoice: {e}")
        return None


def create_custom_banking_template():
    """Create template for custom banking data collection"""
    print("\nCreating custom banking data template...")
    
    template = {
        "instructions": "Add your custom banking queries here",
        "format": {
            "text": "user query text",
            "intent": "intent_name",
            "entities": {
                "amount": "extracted amount if present",
                "recipient": "recipient name if present",
                "account_number": "account number if present"
            }
        },
        "example": {
            "text": "Transfer ₹5000 to Akash",
            "intent": "transfer_funds",
            "entities": {
                "amount": "5000",
                "recipient": "Akash"
            }
        },
        "intents": [
            "check_balance",
            "transfer_funds",
            "view_transactions",
            "loan_inquiry",
            "interest_inquiry",
            "credit_limit_inquiry",
            "set_reminder",
            "payment_alert"
        ]
    }
    
    os.makedirs("data/custom", exist_ok=True)
    
    with open("data/custom/template.json", "w") as f:
        json.dump(template, f, indent=2)
    
    # Create empty CSV for data collection
    df_template = pd.DataFrame(columns=['text', 'intent', 'entities'])
    df_template.to_csv("data/custom/collected_data.csv", index=False)
    
    print("✓ Custom banking data template created!")
    print("  - Template: data/custom/template.json")
    print("  - Data file: data/custom/collected_data.csv")


def main():
    """Main function"""
    print("=" * 60)
    print("Banking Dataset Downloader")
    print("=" * 60)
    
    # Create data directory
    os.makedirs("data", exist_ok=True)
    
    # Download Banking77
    banking77 = download_banking77()
    
    # Create custom template
    create_custom_banking_template()
    
    # Optional: Download CommonVoice (commented out as it's large)
    # download_common_voice("en")
    
    print("\n" + "=" * 60)
    print("Download complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Review the Banking77 dataset in data/banking77/")
    print("2. Use data/custom/collected_data.csv to collect your own data")
    print("3. See MODELS_AND_DATASETS.md for training instructions")


if __name__ == "__main__":
    main()

