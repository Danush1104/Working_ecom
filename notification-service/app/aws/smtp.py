import os
import smtplib
from email.message import EmailMessage
from app.config import Config
from app.logger import logger

class SMTPClient:
    def __init__(self):
        self.host = Config.SMTP_HOST
        self.port = Config.SMTP_PORT
        self.user = Config.SMTP_USER
        self.password = Config.SMTP_PASSWORD
        
    def send_email(self, recipient: str, subject: str, body_text: str) -> None:
        try:
            msg = EmailMessage()
            msg.set_content(body_text)
            msg['Subject'] = subject
            msg['From'] = Config.SENDER_EMAIL
            msg['To'] = recipient

            # Using standard SMTP with STARTTLS as per standard implementations
            with smtplib.SMTP(self.host, self.port) as server:
                if self.user and self.password:
                    server.starttls()
                    server.login(self.user, self.password)
                server.send_message(msg)
                
            logger.info(f"Email sent to {recipient} via SMTP.")
        except Exception as e:
            logger.error(f"Failed to send email to {recipient} via SMTP: {str(e)}")
            raise
