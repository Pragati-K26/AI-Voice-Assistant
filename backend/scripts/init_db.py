"""
Initialize database with sample data
"""
from app.core.database import SessionLocal, init_db
from app.models.user import User
from app.services.auth_service import auth_service

def create_sample_users():
    """Create sample users for testing"""
    db = SessionLocal()
    
    try:
        # Check if users exist
        if db.query(User).count() > 0:
            print("Users already exist, skipping...")
            return
        
        # Create sample users
        users = [
            {
                "username": "demo_user",
                "email": "demo@example.com",
                "password": "demo123",
                "account_number": "ACC001234567",
                "balance": 50000.0,
                "credit_limit": 50000.0
            },
            {
                "username": "test_user",
                "email": "test@example.com",
                "password": "test123",
                "account_number": "ACC009876543",
                "balance": 25000.0,
                "credit_limit": 30000.0
            }
        ]
        
        for user_data in users:
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=auth_service.get_password_hash(user_data["password"]),
                account_number=user_data["account_number"],
                balance=user_data["balance"],
                credit_limit=user_data["credit_limit"],
                voice_pin_hash=auth_service.get_password_hash("1234")  # Default voice PIN
            )
            db.add(user)
        
        db.commit()
        print("Sample users created successfully!")
        print("\nTest Credentials:")
        print("Username: demo_user, Password: demo123, Voice PIN: 1234")
        print("Username: test_user, Password: test123, Voice PIN: 1234")
        
    except Exception as e:
        print(f"Error creating users: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    create_sample_users()

