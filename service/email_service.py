import smtplib
import json
from email.message import EmailMessage

import requests

from core.setting import get_settings


class EmailService:

    def __init__(self):
        self.settings = get_settings()

    def is_configured(self):
        return self.is_resend_configured() or self.is_smtp_configured()

    def is_resend_configured(self):
        return bool(self.settings.resend_api_key and self.settings.resend_from_email)

    def is_smtp_configured(self):

        return bool(
            self.settings.smtp_host
            and self.settings.smtp_from_email
            and self.settings.smtp_username
            and self.settings.smtp_password
        )

    def send_candidate_feedback(
        self,
        to_email : str,
        candidate_name : str,
        job_title : str,
        company_name : str,
        message : str,
    ):
        if self.is_resend_configured():
            return self._send_with_resend(
                to_email=to_email,
                candidate_name=candidate_name,
                job_title=job_title,
                company_name=company_name,
                message=message,
            )

        if self.is_smtp_configured():
            return self._send_with_smtp(
                to_email=to_email,
                candidate_name=candidate_name,
                job_title=job_title,
                company_name=company_name,
                message=message,
            )

        return {
            "sent": False,
            "status": "not_configured",
            "error": "Email não configurado",
        }

    def _build_email_text(self, candidate_name : str, company_name : str, message : str):
        return "\n".join(
            [
                f"Olá {candidate_name},",
                "",
                message,
                "",
                f"Equipa {company_name}",
                "Kukalakala",
            ]
        )

    def _send_with_resend(
        self,
        to_email : str,
        candidate_name : str,
        job_title : str,
        company_name : str,
        message : str,
    ):
        payload = json.dumps(
            {
                "from": f"{self.settings.resend_from_name} <{self.settings.resend_from_email}>",
                "to": [to_email],
                "subject": f"Atualização da candidatura - {job_title}",
                "text": self._build_email_text(candidate_name, company_name, message),
            }
        ).encode("utf-8")
        try:
            response = requests.post(
                "https://api.resend.com/emails",
                data=payload,
                timeout=15,
                headers={
                    "Authorization": f"Bearer {self.settings.resend_api_key}",
                    "Content-Type": "application/json",
                },
            )
            response_data = response.json() if response.text else {}
            response.raise_for_status()

            return {
                "sent": True,
                "status": "sent",
                "error": None,
                "provider": "resend",
                "provider_id": response_data.get("id"),
            }
        except requests.HTTPError as exc:
            response_body = exc.response.text if exc.response is not None else ""
            return {
                "sent": False,
                "status": "failed",
                "error": response_body or str(exc),
                "provider": "resend",
            }
        except Exception as exc:
            return {
                "sent": False,
                "status": "failed",
                "error": str(exc),
                "provider": "resend",
            }

    def _send_with_smtp(
        self,
        to_email : str,
        candidate_name : str,
        job_title : str,
        company_name : str,
        message : str,
    ):
        email = EmailMessage()
        email["Subject"] = f"Atualização da candidatura - {job_title}"
        email["From"] = f"{self.settings.smtp_from_name} <{self.settings.smtp_from_email}>"
        email["To"] = to_email
        email.set_content(self._build_email_text(candidate_name, company_name, message))

        try:
            with smtplib.SMTP(self.settings.smtp_host, self.settings.smtp_port, timeout=15) as smtp:
                if self.settings.smtp_use_tls:
                    smtp.starttls()

                smtp.login(self.settings.smtp_username, self.settings.smtp_password)
                smtp.send_message(email)

            return {
                "sent": True,
                "status": "sent",
                "error": None,
                "provider": "smtp",
            }
        except Exception as exc:
            return {
                "sent": False,
                "status": "failed",
                "error": str(exc),
                "provider": "smtp",
            }
