import hashlib
import hmac
import os


ITERATIONS = 260_000
SALT_SIZE = 16


def hash_password(password: str) -> str:
    salt = os.urandom(SALT_SIZE)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        ITERATIONS,
    )
    return f"pbkdf2_sha256${ITERATIONS}${salt.hex()}${password_hash.hex()}"


def verify_password(password: str, stored_password_hash: str | None) -> bool:
    if not stored_password_hash:
        return False

    try:
        algorithm, iterations, salt, password_hash = stored_password_hash.split("$", 3)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    candidate_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt),
        int(iterations),
    ).hex()

    return hmac.compare_digest(candidate_hash, password_hash)
