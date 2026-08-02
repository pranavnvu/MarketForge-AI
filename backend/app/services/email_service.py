from __future__ import annotations
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import structlog
import httpx
from app.core.config import settings

logger = structlog.get_logger(__name__)


class EmailService:
    @staticmethod
    async def send_password_reset_email(to_email: str, reset_token: str) -> bool:
        reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
        subject = "Reset Your DevForge AI Password"

        logger.info("attempting_email_delivery", to=to_email, link=reset_link)

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; }}
            .container {{ max-width: 540px; margin: 0 auto; background: #1e293b; border-radius: 16px; border: 1px solid rgba(255,255,255,0.1); padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }}
            .logo {{ font-size: 24px; font-weight: bold; color: #c084fc; text-align: center; margin-bottom: 24px; }}
            h2 {{ color: #ffffff; font-size: 20px; margin-top: 0; }}
            p {{ color: #94a3b8; line-height: 1.6; font-size: 14px; }}
            .btn {{ display: inline-block; background: linear-gradient(135deg, #a855f7 0%, #06b6d4 100%); color: #ffffff !important; padding: 12px 28px; border-radius: 12px; font-weight: 600; text-decoration: none; margin: 20px 0; }}
            .footer {{ margin-top: 32px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 20px; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">⚡ DevForge AI</div>
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset your password for your DevForge AI account. Click the button below to set a new password:</p>
            <div style="text-align: center;">
              <a href="{reset_link}" class="btn">Reset Password</a>
            </div>
            <p>Or copy and paste this URL into your web browser:</p>
            <p style="word-break: break-all; color: #38bdf8; font-size: 12px;">{reset_link}</p>
            <p>This password reset link will expire in 2 hours.</p>
            <div class="footer">
              &copy; 2026 DevForge AI — Autonomous Multi-Agent Platform
            </div>
          </div>
        </body>
        </html>
        """

        # Resend API Key check
        resend_key = getattr(settings, "RESEND_API_KEY", "") or settings.SMTP_PASSWORD
        if resend_key and resend_key.startswith("re_"):
            try:
                async with httpx.AsyncClient() as client:
                    res = await client.post(
                        "https://api.resend.com/emails",
                        headers={
                            "Authorization": f"Bearer {resend_key}",
                            "Content-Type": "application/json",
                        },
                        json={
                            "from": settings.EMAILS_FROM or "onboarding@resend.dev",
                            "to": [to_email],
                            "subject": subject,
                            "html": html_content,
                        },
                        timeout=10.0,
                    )
                    if res.status_code in (200, 201):
                        logger.info("email_sent_successfully_via_resend", to=to_email)
                        return True
                    else:
                        logger.error("resend_api_error_response", status=res.status_code, body=res.text)
            except Exception as e:
                logger.error("resend_api_exception", error=str(e))

        # Standard SMTP Check
        if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD and "your-app-password" not in settings.SMTP_PASSWORD:
            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = settings.EMAILS_FROM or settings.SMTP_USER
                msg["To"] = to_email
                msg.attach(MIMEText(html_content, "html"))

                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    server.starttls()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(msg["From"], [to_email], msg.as_string())

                logger.info("email_sent_successfully_via_smtp", to=to_email)
                return True
            except Exception as e:
                logger.error("smtp_error", error=str(e))

        logger.error("email_sending_failed_missing_api_key", note="Please set a valid Resend API Key (re_...) in .env under SMTP_PASSWORD=re_...")
        return False
