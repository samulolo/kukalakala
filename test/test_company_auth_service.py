from datetime import date

import pytest

from exception.app_exceptions import BadRequest
from schema.company import CompanyCreate, CompanyLogin
from service.company_service import CompanyService


class FakeCompanyRepository:

    def __init__(self, company=None):
        self.company = company
        self.saved = None

    def get_by_id(self, company_id):
        if self.company and self.company.id == company_id:
            return self.company
        return None

    def get_by_email(self, email):
        if self.company and self.company.email == email:
            return self.company
        return None

    def save(self, company):
        self.saved = company
        self.company = company
        return company


def build_company_create():
    return CompanyCreate(
        name="Northwind",
        email="empresa@email.com",
        password="password123",
        sector="Tecnologia",
        location="Lisboa",
        foundation_date=date(2021, 1, 1),
    )


def test_company_register_hashes_password():
    repository = FakeCompanyRepository()
    service = CompanyService(repository)

    company = service.create(build_company_create())

    assert company.password_hash
    assert company.password_hash != "password123"


def test_company_login_accepts_correct_password():
    repository = FakeCompanyRepository()
    service = CompanyService(repository)
    service.create(build_company_create())

    company = service.login(CompanyLogin(email="empresa@email.com", password="password123"))

    assert company.email == "empresa@email.com"


def test_company_login_rejects_wrong_password():
    repository = FakeCompanyRepository()
    service = CompanyService(repository)
    service.create(build_company_create())

    with pytest.raises(BadRequest, match="Email ou palavra-passe inválidos"):
        service.login(CompanyLogin(email="empresa@email.com", password="wrongpass"))
