import uuid

from fastapi import APIRouter, Depends, Header, Query, status

from controller.dependencies import get_company_service, get_job_service
from exception.app_exceptions import BadRequest
from schema.app_response import BaseResponse, success_response
from schema.auth import auth_payload
from schema.company import CompanyCreate, CompanyLogin
from schema.job import JobCreateWithoutCompany
from domain.job import JobType
from service.auth_token_service import AuthTokenService
from service.company_service import CompanyService
from service.job_service import JobService


company_auth_controller = APIRouter(prefix="/api/v1/company-auth", tags=["company auth"])


def get_bearer_token(authorization : str = Header(None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise BadRequest("Sessão inválida ou expirada")

    return authorization.split(" ", 1)[1].strip()


def get_company_id_from_token(token : str, company_service : CompanyService = None) -> uuid.UUID:
    payload = AuthTokenService().verify_any_access_token(token)

    if not payload:
        raise BadRequest("Sessão inválida ou expirada")

    if payload.get("provider") == "supabase":
        if payload.get("role") and payload.get("role") != "company":
            raise BadRequest("Sessão inválida ou expirada")

        if not company_service or not payload.get("email") or not payload.get("email_confirmed"):
            raise BadRequest("Sessão inválida ou expirada")

        company = company_service.get_or_create_from_auth(
            email=payload["email"],
            name=payload.get("name"),
            sector=payload.get("sector"),
            location=payload.get("location"),
            foundation_date=payload.get("foundation_date"),
        )
        return company.id

    if payload.get("role") != "company":
        raise BadRequest("Sessão inválida ou expirada")

    try:
        return uuid.UUID(payload["sub"])
    except (TypeError, ValueError):
        raise BadRequest("Sessão inválida ou expirada")


@company_auth_controller.post("/register", status_code=status.HTTP_201_CREATED, response_model=BaseResponse)
def register(company_create : CompanyCreate, company_service : CompanyService = Depends(get_company_service)) -> BaseResponse:
    company = company_service.create(company_create)
    serialized_company = company_service.serialize(company)
    token_data = AuthTokenService().create_access_token(str(company.id), role="company")
    return success_response(
        status_code=status.HTTP_201_CREATED,
        data=auth_payload(serialized_company, token_data, user_key="company"),
        message="Empresa criada com sucesso"
    )


@company_auth_controller.post("/login", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def login(company_login : CompanyLogin, company_service : CompanyService = Depends(get_company_service)) -> BaseResponse:
    company = company_service.login(company_login)
    serialized_company = company_service.serialize(company)
    token_data = AuthTokenService().create_access_token(str(company.id), role="company")
    return success_response(
        data=auth_payload(serialized_company, token_data, user_key="company"),
        message="Login realizado com sucesso"
    )


@company_auth_controller.get("/me", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def me(
    token : str = Depends(get_bearer_token),
    company_service : CompanyService = Depends(get_company_service),
) -> BaseResponse:
    company_id = get_company_id_from_token(token, company_service)
    company = company_service.get_by_id(company_id)

    return success_response(
        data=company_service.serialize(company),
        message="Sessão válida"
    )


@company_auth_controller.post("/me/jobs", status_code=status.HTTP_201_CREATED, response_model=BaseResponse)
def create_job_for_authenticated_company(
    job_create : JobCreateWithoutCompany,
    token : str = Depends(get_bearer_token),
    company_service : CompanyService = Depends(get_company_service),
    job_service : JobService = Depends(get_job_service),
) -> BaseResponse:
    company_id = get_company_id_from_token(token, company_service)
    job = job_service.create(job_create.to_job_create(company_id))

    return success_response(
        status_code=status.HTTP_201_CREATED,
        data=job_service.serialize(job),
        message="Vaga criada com sucesso"
    )


@company_auth_controller.get("/me/jobs", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def list_jobs_for_authenticated_company(
    page : int = Query(1, ge=1),
    limit : int = Query(10, ge=1, le=100),
    is_active : bool = Query(None),
    type : JobType = Query(None),
    q : str = Query(None),
    token : str = Depends(get_bearer_token),
    company_service : CompanyService = Depends(get_company_service),
    job_service : JobService = Depends(get_job_service),
) -> BaseResponse:
    company_id = get_company_id_from_token(token, company_service)
    jobs = job_service.list(page, limit, company_id=company_id, is_active=is_active, type=type, q=q)

    return success_response(
        data=jobs,
        message="Vagas da empresa autenticada listadas com sucesso"
    )
