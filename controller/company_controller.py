import uuid

from fastapi import APIRouter, Depends, Query, status

from controller.dependencies import get_company_service, get_job_service
from controller.auth.company_auth_controller import get_bearer_token, get_company_id_from_token
from exception.app_exceptions import BadRequest
from domain.job import JobType
from schema.app_response import BaseResponse, success_response
from schema.company import CompanyCreate, CompanyUpdate
from service.company_service import CompanyService
from service.job_service import JobService


company_controller = APIRouter(prefix="/api/v1/company", tags=["company"])


@company_controller.get("/", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get_all(
    page : int = Query(1, ge=1),
    limit : int = Query(10, ge=1, le=100),
    token : str = Depends(get_bearer_token),
    company_service : CompanyService = Depends(get_company_service),
) -> BaseResponse:
    get_company_id_from_token(token, company_service)
    companies = company_service.list(page, limit)
    return success_response(
        data=companies,
        message="Empresas listadas com sucesso"
    )


@company_controller.get("/{company_id}/jobs", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get_jobs(
    company_id : uuid.UUID,
    page : int = Query(1, ge=1),
    limit : int = Query(10, ge=1, le=100),
    is_active : bool = Query(None),
    type : JobType = Query(None),
    q : str = Query(None),
    token : str = Depends(get_bearer_token),
    company_service : CompanyService = Depends(get_company_service),
    job_service : JobService = Depends(get_job_service),
) -> BaseResponse:
    authenticated_company_id = get_company_id_from_token(token, company_service)
    if authenticated_company_id != company_id:
        raise BadRequest("Esta empresa não pertence à sessão autenticada")

    jobs = job_service.list(page, limit, company_id=company_id, is_active=is_active, type=type, q=q)
    return success_response(
        data=jobs,
        message="Vagas da empresa listadas com sucesso"
    )


@company_controller.get("/{company_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get(
    company_id : uuid.UUID,
    token : str = Depends(get_bearer_token),
    company_service : CompanyService = Depends(get_company_service),
) -> BaseResponse:
    authenticated_company_id = get_company_id_from_token(token, company_service)
    if authenticated_company_id != company_id:
        raise BadRequest("Esta empresa não pertence à sessão autenticada")

    company = company_service.get_by_id(company_id)
    return success_response(
        data=company_service.serialize(company),
        message="Empresa encontrada com sucesso"
    )


@company_controller.post("/", status_code=status.HTTP_201_CREATED, response_model=BaseResponse)
def create(company_create : CompanyCreate, company_service : CompanyService = Depends(get_company_service)) -> BaseResponse:
    company = company_service.create(company_create)
    return success_response(
        status_code=status.HTTP_201_CREATED,
        data=company_service.serialize(company),
        message="Empresa criada com sucesso"
    )


@company_controller.put("/{company_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def update(
    company_id : uuid.UUID,
    company_update : CompanyUpdate,
    token : str = Depends(get_bearer_token),
    company_service : CompanyService = Depends(get_company_service),
) -> BaseResponse:
    authenticated_company_id = get_company_id_from_token(token, company_service)
    if authenticated_company_id != company_id:
        raise BadRequest("Esta empresa não pertence à sessão autenticada")

    company = company_service.update(company_id, company_update)
    return success_response(
        data=company_service.serialize(company),
        message="Empresa atualizada com sucesso"
    )


@company_controller.delete("/{company_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def delete(
    company_id : uuid.UUID,
    token : str = Depends(get_bearer_token),
    company_service : CompanyService = Depends(get_company_service),
) -> BaseResponse:
    authenticated_company_id = get_company_id_from_token(token, company_service)
    if authenticated_company_id != company_id:
        raise BadRequest("Esta empresa não pertence à sessão autenticada")

    company_service.delete(company_id)
    return success_response(message="Empresa removida com sucesso")
