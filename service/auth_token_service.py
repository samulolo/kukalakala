import base64
import hashlib
import hmac
import json
import time
from typing import Any

from core.setting import get_settings


def _base64url_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).rstrip(b"=").decode("ascii")


def _base64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}")


class AuthTokenService:

    def __init__(self):
        self.settings = get_settings()

    def create_access_token(self, subject: str, role: str = "candidate") -> dict[str, Any]:
        expires_at = int(time.time()) + (self.settings.jwt_expires_minutes * 60)
        payload = {
            "sub": subject,
            "role": role,
            "exp": expires_at,
            "iat": int(time.time()),
        }
        token = self._encode(payload)

        return {
            "access_token": token,
            "token_type": "Bearer",
            "expires_in": self.settings.jwt_expires_minutes * 60,
        }

    def verify_access_token(self, token: str) -> dict[str, Any] | None:
        try:
            header_value, payload_value, signature_value = token.split(".")
        except ValueError:
            return None

        expected_signature = self._sign(f"{header_value}.{payload_value}")
        if not hmac.compare_digest(expected_signature, signature_value):
            return None

        try:
            payload = json.loads(_base64url_decode(payload_value))
        except (ValueError, json.JSONDecodeError):
            return None

        if int(payload.get("exp", 0)) < int(time.time()):
            return None

        return payload

    def _encode(self, payload: dict[str, Any]) -> str:
        header = {"alg": "HS256", "typ": "JWT"}
        header_value = _base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
        payload_value = _base64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
        signature = self._sign(f"{header_value}.{payload_value}")
        return f"{header_value}.{payload_value}.{signature}"

    def _sign(self, value: str) -> str:
        signature = hmac.new(
            self.settings.jwt_secret.encode("utf-8"),
            value.encode("utf-8"),
            hashlib.sha256,
        ).digest()
        return _base64url_encode(signature)
