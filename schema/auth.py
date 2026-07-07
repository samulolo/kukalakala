from typing import Any


def auth_payload(user: Any, token_data: dict, user_key: str = "candidate") -> dict:
    return {
        user_key: user,
        "user": user,
        **token_data,
    }
