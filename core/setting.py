from dotenv import load_dotenv
from dataclasses import dataclass
import os


load_dotenv()

@dataclass
class Settings():
    database_url : str
    open_ai_secret : str
    supabase_url : str
    supabase_key : str
    supabase_service_role : str
    redis_url : str
    jwt_secret : str
    jwt_expires_minutes : int
    smtp_host : str
    smtp_port : int
    smtp_username : str
    smtp_password : str
    smtp_from_email : str
    smtp_from_name : str
    smtp_use_tls : bool
    resend_api_key : str
    resend_from_email : str
    resend_from_name : str



def get_settings() -> Settings:

    setting = Settings(
        database_url = os.getenv("DATABASE_URL"),
        open_ai_secret=os.getenv("OPEN_AI_KEY"),
        supabase_url=os.getenv("SUPABASE_URL"),
        supabase_key=os.getenv("SUPABASE_KEY"),
        supabase_service_role=os.getenv("SERVICE_ROLE", os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")),
        redis_url=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
        jwt_secret=os.getenv("JWT_SECRET", "kukalakala-local-development-secret"),
        jwt_expires_minutes=int(os.getenv("JWT_EXPIRES_MINUTES", "10080")),
        smtp_host=os.getenv("SMTP_HOST", ""),
        smtp_port=int(os.getenv("SMTP_PORT", "587")),
        smtp_username=os.getenv("SMTP_USERNAME", ""),
        smtp_password=os.getenv("SMTP_PASSWORD", ""),
        smtp_from_email=os.getenv("SMTP_FROM_EMAIL", ""),
        smtp_from_name=os.getenv("SMTP_FROM_NAME", "Kukalakala"),
        smtp_use_tls=os.getenv("SMTP_USE_TLS", "true").lower() in ("1", "true", "yes", "on"),
        resend_api_key=os.getenv("RESEND_API_KEY", ""),
        resend_from_email=os.getenv("RESEND_FROM_EMAIL", "onboarding@resend.dev"),
        resend_from_name=os.getenv("RESEND_FROM_NAME", "Kukalakala"),
    )


    return setting
