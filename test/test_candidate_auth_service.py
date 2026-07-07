import pytest

from domain.candidate import Candidate
from exception.app_exceptions import BadRequest
from schema.candidate.candidate import CandidateCreate, CandidateLogin
from service.candidate_service import CandidateService


class FakeCandidateRepository:

    def __init__(self, candidate=None):
        self.candidate = candidate
        self.saved = None

    def get_by_email(self, email):
        if self.candidate and self.candidate.email == email:
            return self.candidate
        return None

    def save(self, candidate):
        self.saved = candidate
        self.candidate = candidate
        return candidate


def test_candidate_register_hashes_password():
    repository = FakeCandidateRepository()
    service = CandidateService(repository)

    candidate = service.create(
        CandidateCreate(
            name="Maria",
            email="maria@email.com",
            password="password123",
        )
    )

    assert candidate.password_hash
    assert candidate.password_hash != "password123"


def test_candidate_login_requires_correct_password():
    repository = FakeCandidateRepository()
    service = CandidateService(repository)
    service.create(
        CandidateCreate(
            name="Maria",
            email="maria@email.com",
            password="password123",
        )
    )

    candidate = service.login(
        CandidateLogin(email="maria@email.com", password="password123")
    )

    assert candidate.email == "maria@email.com"


def test_candidate_login_rejects_wrong_password():
    repository = FakeCandidateRepository()
    service = CandidateService(repository)
    service.create(
        CandidateCreate(
            name="Maria",
            email="maria@email.com",
            password="password123",
        )
    )

    with pytest.raises(BadRequest, match="Email ou palavra-passe inválidos"):
        service.login(CandidateLogin(email="maria@email.com", password="wrongpass"))


def test_candidate_login_rejects_candidates_without_password_hash():
    candidate = Candidate(name="Maria", email="maria@email.com")
    service = CandidateService(FakeCandidateRepository(candidate))

    with pytest.raises(BadRequest, match="Email ou palavra-passe inválidos"):
        service.login(CandidateLogin(email="maria@email.com", password="password123"))
