"""
Database models
"""
# Import models to make them available at package level
# Note: We import them individually to avoid circular imports

__all__ = ["User", "Transaction", "VoiceSession"]

def __getattr__(name):
    """Lazy import to avoid circular dependencies"""
    if name == "User":
        from app.models.user import User
        return User
    elif name == "Transaction":
        from app.models.transaction import Transaction
        return Transaction
    elif name == "VoiceSession":
        from app.models.session import VoiceSession
        return VoiceSession
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")

# For explicit imports, these will work:
# from app.models.user import User
# from app.models.transaction import Transaction
# from app.models.session import VoiceSession

