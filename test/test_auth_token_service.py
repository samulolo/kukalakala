from service.auth_token_service import AuthTokenService


def test_access_token_contains_candidate_subject():
    token_service = AuthTokenService()

    token_data = token_service.create_access_token("candidate-id")
    payload = token_service.verify_access_token(token_data["access_token"])

    assert payload is not None
    assert payload["sub"] == "candidate-id"
    assert payload["role"] == "candidate"


def test_access_token_rejects_invalid_signature():
    token_service = AuthTokenService()

    token_data = token_service.create_access_token("candidate-id")
    token_parts = token_data["access_token"].split(".")
    token_parts[-1] = "invalid"

    assert token_service.verify_access_token(".".join(token_parts)) is None
