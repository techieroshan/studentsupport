"""Email service for sending emails via Mailpit (dev) or emailit.com (prod)."""
import os
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import requests
from typing import Optional


class EmailService:
    def __init__(self):
        self.backend = os.getenv("EMAIL_BACKEND", "mailpit")
        self.mailpit_host = os.getenv("MAILPIT_HOST", "localhost")
        self.mailpit_port = int(os.getenv("MAILPIT_PORT", "1025"))
        self.emailit_api_key = os.getenv("EMAILIT_API_KEY")
        self.emailit_api_url = os.getenv("EMAILIT_API_URL", "https://api.emailit.com/v1")
        self.app_name = os.getenv("APP_NAME", "Student Support")
        self.app_domain = os.getenv("APP_DOMAIN", "studentsupport.newabilities.org")
        self.org_name = os.getenv("ORG_NAME", "New Abilities Foundation")
        self.org_contact_url = os.getenv("ORG_CONTACT_URL", "https://newabilities.org/contact")
    
    async def send_email(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send an email using the configured backend."""
        if self.backend == "mailpit":
            return await self._send_via_mailpit(to_email, subject, html_content, text_content)
        else:
            return await self._send_via_emailit(to_email, subject, html_content, text_content)
    
    async def _send_via_mailpit(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email via Mailpit (local development)."""
        try:
            message = MIMEMultipart("alternative")
            message["From"] = f"{self.app_name} <noreply@{self.app_domain}>"
            message["To"] = to_email
            message["Subject"] = subject
            
            # Add text and HTML parts
            if text_content:
                part1 = MIMEText(text_content, "plain")
                message.attach(part1)
            
            part2 = MIMEText(html_content, "html")
            message.attach(part2)
            
            # Send via SMTP
            await aiosmtplib.send(
                message,
                hostname=self.mailpit_host,
                port=self.mailpit_port,
            )
            return True
        except Exception as e:
            print(f"Error sending email via Mailpit: {e}")
            return False
    
    async def _send_via_emailit(
        self, 
        to_email: str, 
        subject: str, 
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """Send email via emailit.com (production)."""
        try:
            if not self.emailit_api_key:
                print("EMAILIT_API_KEY not configured")
                return False
            
            headers = {
                "Authorization": f"Bearer {self.emailit_api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "from": {
                    "email": f"noreply@{self.app_domain}",
                    "name": self.app_name
                },
                "to": [{"email": to_email}],
                "subject": subject,
                "html": html_content
            }
            
            if text_content:
                data["text"] = text_content
            
            response = requests.post(
                f"{self.emailit_api_url}/send",
                headers=headers,
                json=data,
                timeout=10
            )
            
            return response.status_code == 200
        except Exception as e:
            print(f"Error sending email via emailit: {e}")
            return False
    
    def get_email_template(self, template_type: str, **kwargs) -> tuple[str, str]:
        """Get email template HTML and text content."""
        if template_type == "verification":
            return self._verification_template(**kwargs)
        elif template_type == "welcome":
            return self._welcome_template(**kwargs)
        elif template_type == "match_notification":
            return self._match_notification_template(**kwargs)
        elif template_type == "transaction_complete":
            return self._transaction_complete_template(**kwargs)
        else:
            return "", ""
    
    def _verification_template(self, code: str, user_name: str) -> tuple[str, str]:
        """Email verification template."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #0d9488; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0;">{self.app_name}</h1>
            </div>
            <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #0d9488; margin-top: 0;">Welcome, {user_name}!</h2>
                <p>Thank you for joining {self.app_name}. To complete your registration, please verify your email address.</p>
                <div style="background-color: white; padding: 20px; margin: 20px 0; border: 2px dashed #0d9488; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
                    <h1 style="margin: 10px 0; color: #0d9488; font-size: 36px; letter-spacing: 8px;">{code}</h1>
                    <p style="margin: 0; font-size: 12px; color: #999;">This code expires in 10 minutes</p>
                </div>
                <p style="color: #666; font-size: 14px;">If you didn't create an account with {self.app_name}, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    {self.org_name}<br>
                    For support, visit <a href="{self.org_contact_url}" style="color: #0d9488;">{self.org_contact_url}</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        text = f"""
        Welcome to {self.app_name}!
        
        Your verification code is: {code}
        
        This code expires in 10 minutes.
        
        If you didn't create an account, please ignore this email.
        
        {self.org_name}
        Support: {self.org_contact_url}
        """
        
        return html, text
    
    def _welcome_template(self, user_name: str) -> tuple[str, str]:
        """Welcome email template."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to {self.app_name}</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #0d9488; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0;">{self.app_name}</h1>
            </div>
            <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #0d9488; margin-top: 0;">Welcome, {user_name}!</h2>
                <p>Your account has been successfully verified. You're now part of our community dedicated to supporting students with free meals and food assistance.</p>
                <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h3 style="color: #0d9488; margin-top: 0;">Getting Started:</h3>
                    <ul style="color: #666;">
                        <li>Browse available meal offers in your area</li>
                        <li>Post your dietary preferences and requirements</li>
                        <li>Connect with verified donors</li>
                        <li>Rate and review your experiences</li>
                    </ul>
                </div>
                <p style="text-align: center; margin-top: 30px;">
                    <a href="https://{self.app_domain}" style="background-color: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Visit {self.app_name}</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    {self.org_name}<br>
                    For support, visit <a href="{self.org_contact_url}" style="color: #0d9488;">{self.org_contact_url}</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        text = f"""
        Welcome to {self.app_name}, {user_name}!
        
        Your account has been successfully verified.
        
        Getting Started:
        - Browse available meal offers in your area
        - Post your dietary preferences and requirements
        - Connect with verified donors
        - Rate and review your experiences
        
        Visit: https://{self.app_domain}
        
        {self.org_name}
        Support: {self.org_contact_url}
        """
        
        return html, text
    
    def _match_notification_template(self, user_name: str, match_type: str, match_details: str) -> tuple[str, str]:
        """Match notification template."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Match Notification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #0d9488; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0;">{self.app_name}</h1>
            </div>
            <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #0d9488; margin-top: 0;">Hi {user_name}! 👋</h2>
                <p>Great news! You have a new {match_type} match.</p>
                <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="color: #666;">{match_details}</p>
                </div>
                <p style="text-align: center; margin-top: 30px;">
                    <a href="https://{self.app_domain}" style="background-color: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">View Details</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    {self.org_name}<br>
                    For support, visit <a href="{self.org_contact_url}" style="color: #0d9488;">{self.org_contact_url}</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        text = f"""
        Hi {user_name}!
        
        You have a new {match_type} match.
        
        {match_details}
        
        Visit: https://{self.app_domain}
        
        {self.org_name}
        Support: {self.org_contact_url}
        """
        
        return html, text
    
    def _transaction_complete_template(self, user_name: str, transaction_details: str) -> tuple[str, str]:
        """Transaction complete template."""
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Transaction Complete</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #0d9488; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <h1 style="color: white; margin: 0;">{self.app_name}</h1>
            </div>
            <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
                <h2 style="color: #0d9488; margin-top: 0;">Transaction Complete! ✅</h2>
                <p>Hi {user_name}, your meal transaction has been successfully completed.</p>
                <div style="background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <p style="color: #666;">{transaction_details}</p>
                </div>
                <p>We'd love to hear about your experience! Please consider leaving a rating.</p>
                <p style="text-align: center; margin-top: 30px;">
                    <a href="https://{self.app_domain}" style="background-color: #0d9488; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Leave a Rating</a>
                </p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                <p style="font-size: 12px; color: #999; text-align: center;">
                    {self.org_name}<br>
                    For support, visit <a href="{self.org_contact_url}" style="color: #0d9488;">{self.org_contact_url}</a>
                </p>
            </div>
        </body>
        </html>
        """
        
        text = f"""
        Transaction Complete!
        
        Hi {user_name}, your meal transaction has been successfully completed.
        
        {transaction_details}
        
        Please consider leaving a rating at: https://{self.app_domain}
        
        {self.org_name}
        Support: {self.org_contact_url}
        """
        
        return html, text


# Create a singleton instance
email_service = EmailService()
