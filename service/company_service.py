import uuid
from datetime import date, datetime, timezone

from domain.company import Company
from exception.app_exceptions import BadRequest, ResourceAlreadyExists, ResourceNotFound
from repository.company_repository import CompanyRepository
from schema.company import CompanyCreate, CompanyLogin, CompanyResponse, CompanyUpdate
from schema.pagination import paginate_response, serialize_response
from service.password_service import hash_password, verify_password


class CompanyService:

    def __init__(self, company_repository : CompanyRepository):
        self.company_repository = company_repository

    def get_by_id(self, company_id : uuid.UUID):

        company = self.company_repository.get_by_id(company_id)

        if not company:
            raise ResourceNotFound("Empresa não encontrada")

        return company

    def get_by_email(self, email : str):
        company = self.company_repository.get_by_email(email)

        if not company:
            raise ResourceNotFound("Empresa não encontrada")

        return company

    def get_or_create_from_auth(
        self,
        email : str,
        name : str = None,
        sector : str = None,
        location : str = None,
        foundation_date = None,
    ):
        company = self.company_repository.get_by_email(email)

        if company:
            return company

        if isinstance(foundation_date, str):
            try:
                foundation_date = date.fromisoformat(foundation_date)
            except ValueError:
                foundation_date = None

        new_company = Company(
            name=name or email,
            email=email,
            sector=sector or "Não informado",
            location=location or "Não informado",
            foundation_date=foundation_date,
        )

        return self.company_repository.save(new_company)

    def _ensure_company_exists(self, email : str):
        return self.company_repository.get_by_email(email) is not None

    def list(self, page : int, limit : int):
        offset = (page - 1) * limit
        companies, total = self.company_repository.list(offset, limit)
        return paginate_response(companies, total, page, limit, CompanyResponse)

    def serialize(self, company : Company):
        return serialize_response(company, CompanyResponse)

    def create(self, company_create : CompanyCreate):

        if self._ensure_company_exists(company_create.email):
            raise ResourceAlreadyExists("Já existe uma empresa com esse email")

        company_data = company_create.model_dump(exclude={"password"})
        new_company = Company(
            **company_data,
            password_hash=hash_password(company_create.password)
        )
        new_company.foundation_not_in_future()

        return self.company_repository.save(new_company)

    def login(self, company_login : CompanyLogin):

        company = self.company_repository.get_by_email(company_login.email)

        if not company:
            raise BadRequest("Email ou palavra-passe inválidos")

        if not verify_password(company_login.password, company.password_hash):
            raise BadRequest("Email ou palavra-passe inválidos")

        return company

    def update(self, company_id : uuid.UUID, company_update : CompanyUpdate):

        company = self.company_repository.get_by_id(company_id)

        if not company:
            raise ResourceNotFound("Empresa não encontrada")

        update_data = company_update.model_dump(exclude_unset=True)

        if "email" in update_data:
            exist_company = self.company_repository.get_by_email(update_data["email"])
            if exist_company and exist_company.id != company.id:
                raise ResourceAlreadyExists("Já existe uma empresa com esse email")

        for field, value in update_data.items():
            setattr(company, field, value)

        company.foundation_not_in_future()
        company.updated_at = datetime.now(timezone.utc)

        return self.company_repository.save(company)

    def delete(self, company_id : uuid.UUID):

        company = self.company_repository.get_by_id(company_id)

        if not company:
            raise ResourceNotFound("Empresa não encontrada")

        self.company_repository.delete(company)
