"""
Plaid service for fetching real transaction data
"""
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

# Try to import Plaid, fallback to mock if not available
try:
    from plaid.api import plaid_api
    from plaid.configuration import Configuration
    from plaid.api_client import ApiClient
    PLAID_AVAILABLE = True
except ImportError:
    PLAID_AVAILABLE = False
    logger.warning("Plaid SDK not installed. Using mock transactions.")

class PlaidService:
    """Service for interacting with Plaid API"""
    
    def __init__(self):
        # Try settings first, then fallback to os.getenv
        self.client_id = settings.PLAID_CLIENT_ID or os.getenv("PLAID_CLIENT_ID", "")
        self.secret = settings.PLAID_SECRET or os.getenv("PLAID_SECRET", "")
        self.env = settings.PLAID_ENV or os.getenv("PLAID_ENV", "sandbox")
        self.products = (settings.PLAID_PRODUCTS or os.getenv("PLAID_PRODUCTS", "transactions")).split(",")
        
        logger.info(f"Plaid initialization - Client ID: {self.client_id[:10]}..., Env: {self.env}, Products: {self.products}")
        
        if not self.client_id or not self.secret:
            logger.warning("Plaid credentials not configured. Using mock data.")
            self.enabled = False
        else:
            self.enabled = True
            self._setup_client()
    
    def _setup_client(self):
        """Setup Plaid API client"""
        if not PLAID_AVAILABLE:
            self.enabled = False
            return
        
        try:
            configuration = Configuration(
                host=self._get_host(),
                api_key={
                    'clientId': self.client_id,
                    'secret': self.secret
                }
            )
            api_client = ApiClient(configuration)
            self.client = plaid_api.PlaidApi(api_client)
            logger.info("Plaid client initialized successfully")
        except Exception as e:
            logger.error(f"Error setting up Plaid client: {str(e)}")
            self.enabled = False
    
    def _get_host(self):
        """Get Plaid host based on environment"""
        if not PLAID_AVAILABLE:
            return None
        try:
            hosts = {
                "sandbox": plaid_api.Environment.sandbox,
                "development": plaid_api.Environment.development,
                "production": plaid_api.Environment.production
            }
            return hosts.get(self.env, plaid_api.Environment.sandbox)
        except:
            return None
    
    def create_link_token(self, user_id: str) -> Dict:
        """Create a link token for Plaid Link"""
        if not self.enabled:
            logger.warning("Plaid not enabled, returning error")
            return {"error": "Plaid not configured. Please check credentials in .env file."}
        
        if not PLAID_AVAILABLE:
            logger.warning("Plaid SDK not available")
            return {"error": "Plaid SDK not installed. Run: pip install plaid-python"}
        
        try:
            request = {
                'user': {
                    'client_user_id': user_id
                },
                'client_name': "VoiceBank",
                'products': self.products,
                'country_codes': ['US'],
                'language': 'en'
            }
            
            logger.info(f"Creating link token for user {user_id}")
            response = self.client.link_token_create(request)
            
            if hasattr(response, 'link_token'):
                return {
                    "link_token": response.link_token,
                    "expiration": response.expiration
                }
            elif isinstance(response, dict):
                return {
                    "link_token": response.get('link_token'),
                    "expiration": response.get('expiration')
                }
            else:
                logger.error(f"Unexpected response type: {type(response)}")
                return {"error": "Unexpected response from Plaid API"}
        except Exception as e:
            logger.error(f"Error creating link token: {str(e)}", exc_info=True)
            return {"error": f"Failed to create link token: {str(e)}"}
    
    def exchange_public_token(self, public_token: str) -> Dict:
        """Exchange public token for access token"""
        if not self.enabled:
            return {"error": "Plaid not configured"}
        
        if not PLAID_AVAILABLE:
            return {"error": "Plaid SDK not installed"}
        
        try:
            request = {'public_token': public_token}
            response = self.client.item_public_token_exchange(request)
            
            if hasattr(response, 'access_token'):
                return {
                    "access_token": response.access_token,
                    "item_id": response.item_id
                }
            elif isinstance(response, dict):
                return {
                    "access_token": response.get('access_token'),
                    "item_id": response.get('item_id')
                }
            else:
                return {"error": "Unexpected response from Plaid API"}
        except Exception as e:
            logger.error(f"Error exchanging public token: {str(e)}", exc_info=True)
            return {"error": str(e)}
    
    def get_transactions(
        self,
        access_token: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        count: int = 100
    ) -> List[Dict]:
        """Get transactions from Plaid"""
        if not self.enabled:
            return self._get_mock_transactions()
        
        try:
            if not start_date:
                start_date = datetime.now() - timedelta(days=30)
            if not end_date:
                end_date = datetime.now()
            
            request = {
                'access_token': access_token,
                'start_date': start_date.date(),
                'end_date': end_date.date(),
                'count': count
            }
            
            response = self.client.transactions_get(request)
            transactions = []
            
            # Handle both dict and object responses
            if hasattr(response, 'transactions'):
                tx_list = response.transactions
            elif isinstance(response, dict):
                tx_list = response.get('transactions', [])
            else:
                tx_list = []
            
            for transaction in tx_list:
                # Handle both dict and object
                if hasattr(transaction, 'transaction_id'):
                    tx_id = transaction.transaction_id
                    account_id = transaction.account_id
                    amount = abs(transaction.amount or 0)
                    date = transaction.date
                    name = transaction.name or 'Unknown'
                    merchant_name = getattr(transaction, 'merchant_name', None)
                    category = getattr(transaction, 'category', ['Other'])
                else:
                    tx_id = transaction.get('transaction_id')
                    account_id = transaction.get('account_id')
                    amount = abs(transaction.get('amount', 0))
                    date = transaction.get('date')
                    name = transaction.get('name', 'Unknown')
                    merchant_name = transaction.get('merchant_name')
                    category = transaction.get('category', ['Other'])
                
                transactions.append({
                    "transaction_id": tx_id,
                    "account_id": account_id,
                    "amount": amount,
                    "date": str(date) if date else datetime.now().strftime("%Y-%m-%d"),
                    "name": name,
                    "merchant_name": merchant_name,
                    "category": category if isinstance(category, list) else [category],
                    "type": "debit" if amount > 0 else "credit"
                })
            
            return transactions
        except Exception as e:
            logger.error(f"Error fetching transactions from Plaid: {str(e)}")
            return self._get_mock_transactions()
    
    def _get_mock_transactions(self) -> List[Dict]:
        """Generate mock transactions for testing"""
        categories = {
            "Food and Drink": ["Restaurants", "Fast Food", "Groceries"],
            "Transportation": ["Gas", "Parking", "Public Transit"],
            "Shopping": ["Clothing", "Electronics", "General Merchandise"],
            "Bills": ["Utilities", "Internet", "Phone"],
            "Entertainment": ["Movies", "Music", "Games"],
            "Healthcare": ["Pharmacy", "Doctor", "Dental"]
        }
        
        mock_transactions = []
        base_date = datetime.now()
        
        for i in range(20):
            category = list(categories.keys())[i % len(categories)]
            subcategory = categories[category][i % len(categories[category])]
            
            transaction_date = base_date - timedelta(days=i * 2)
            amount = round((i + 1) * 50.25 + (i * 10.75), 2)
            
            mock_transactions.append({
                "transaction_id": f"MOCK_{i:04d}",
                "account_id": "mock_account",
                "amount": amount,
                "date": transaction_date.strftime("%Y-%m-%d"),
                "name": f"{subcategory} Purchase",
                "merchant_name": f"{subcategory} Store",
                "category": [category, subcategory],
                "type": "debit"
            })
        
        return mock_transactions
    
    def get_accounts(self, access_token: str) -> List[Dict]:
        """Get account information"""
        if not self.enabled:
            return [{
                "account_id": "mock_account",
                "name": "Checking Account",
                "type": "depository",
                "subtype": "checking",
                "balance": {
                    "available": 50000.00,
                    "current": 50000.00
                }
            }]
        
        try:
            request = {'access_token': access_token}
            response = self.client.accounts_get(request)
            
            accounts = []
            # Handle both dict and object responses
            if hasattr(response, 'accounts'):
                account_list = response.accounts
            elif isinstance(response, dict):
                account_list = response.get('accounts', [])
            else:
                account_list = []
            
            for account in account_list:
                # Handle both dict and object
                if hasattr(account, 'account_id'):
                    accounts.append({
                        "account_id": account.account_id,
                        "name": account.name,
                        "type": account.type,
                        "subtype": account.subtype,
                        "balance": account.balances.__dict__ if hasattr(account.balances, '__dict__') else {}
                    })
                else:
                    accounts.append({
                        "account_id": account.get('account_id'),
                        "name": account.get('name'),
                        "type": account.get('type'),
                        "subtype": account.get('subtype'),
                        "balance": account.get('balances', {})
                    })
            
            return accounts
        except Exception as e:
            logger.error(f"Error fetching accounts from Plaid: {str(e)}")
            return []


# Global instance
plaid_service = PlaidService()

