"""SMS service for sending OTP via easify.app."""
import os
import requests
from typing import Optional


class SMSService:
    def __init__(self):
        self.easify_api_key = os.getenv("EASIFY_API_KEY")
        self.easify_api_url = os.getenv("EASIFY_API_URL", "https://api.easify.app/v1")
        self.app_name = os.getenv("APP_NAME", "Student Support")
    
    async def send_sms(self, phone: str, message: str) -> bool:
        """Send an SMS using easify.app API."""
        try:
            if not self.easify_api_key:
                print("EASIFY_API_KEY not configured, skipping SMS")
                # In development, we'll just log the SMS
                print(f"SMS to {phone}: {message}")
                return True
            
            headers = {
                "Authorization": f"Bearer {self.easify_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "to": phone,
                "message": message,
                "from": self.app_name
            }
            
            response = requests.post(
                f"{self.easify_api_url}/sms/send",
                headers=headers,
                json=data,
                timeout=10
            )
            
            return response.status_code == 200
        except Exception as e:
            print(f"Error sending SMS via easify: {e}")
            return False
    
    async def send_otp(self, phone: str, code: str) -> bool:
        """Send OTP code via SMS."""
        message = f"Your {self.app_name} verification code is: {code}. Valid for 10 minutes."
        return await self.send_sms(phone, message)


# Create a singleton instance
sms_service = SMSService()
