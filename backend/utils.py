"""Utility functions."""
import random
import string
from datetime import datetime, timedelta


def generate_otp(length: int = 6) -> str:
    """Generate a random OTP code."""
    return ''.join(random.choices(string.digits, k=length))


def generate_pin(length: int = 4) -> str:
    """Generate a random PIN."""
    return ''.join(random.choices(string.digits, k=length))


def get_otp_expiry() -> datetime:
    """Get OTP expiry time (10 minutes from now)."""
    import os
    expiry_minutes = int(os.getenv("OTP_EXPIRY_MINUTES", "10"))
    return datetime.utcnow() + timedelta(minutes=expiry_minutes)
