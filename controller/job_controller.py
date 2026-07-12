import uuid

from fastapi import APIRouter, Depends, Query, status

from controller.dependencies import get_application_service, get_company_service, get_job_service
from controller.auth.company_auth_controller import get_bearer_token, get_company_id_from_token
from domain.application import ApplicationStatus
from domain.job import JobType
from schema.app_response import BaseResponse, success_response
from schema.job import JobCreate, JobUpdate
from service.application_service import ApplicationService
from service.company_service import CompanyService
from service.job_service import JobService


job_controller = APIRouter(prefix="/api/v1/job", tags=["job"])


@job_controller.get("/", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get_all(
    page : int = Query(1, ge=1),
    limit : int = Query(10, ge=1, le=100),
    company_id : uuid.UUID = Query(None),
    is_active : bool = Query(None),
    type : JobType = Query(None),
    q : str = Query(None),
    token : str = Depends(get_bearer_token),
    company_service : CompanyService = Depends(get_company_service),
    job_service : JobService = Depends(get_job_service),
) -> BaseResponse:
    authenticated_company_id = get_company_id_from_token(token, company_service)

    if company_id is not None and company_id != authenticated_company_id:
        company_id = authenticated_company_id
    elif company_id is None:
        company_id = authenticated_company_id

    jobs = job_service.list(page, limit, company_id, is_active, type, q)
    return success_response(
        data=jobs,
        message="Vagas listadas com sucesso"
    )


@job_controller.get("/public", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get_public(
    page : int = Query(1, ge=1),
    limit : int = Query(10, ge=1, le=100),
    type : JobType = Query(None),
    q : str = Query(None),
    job_service : JobService = Depends(get_job_service),
) -> BaseResponse:
    jobs = job_service.list_public(page, limit, type, q)
    return success_response(
        data=jobs,
        message="Vagas públicas listadas com sucesso"
    )


@job_controller.get("/{job_id}/applications", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get_applications(
    job_id : uuid.UUID,
    page : int = Query(1, ge=1),
    limit : int = Query(10, ge=1, le=100),
    status : ApplicationStatus = Query(None),
    token : str = Depends(get_bearer_token),
    company_service : CompanyService = Depends(get_company_service),
    application_service : ApplicationService = Depends(get_application_service),
) -> BaseResponse:
    company_id = get_company_id_from_token(token, company_service)
    applications = application_service.list_for_company_job(page, limit, job_id=job_id, company_id=company_id, status=status)
    return success_response(
        data=applications,
        message="Candidaturas da vaga listadas com sucesso"
    )


@job_controller.get("/{job_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get(job_id : uuid.UUID, job_service : JobService = Depends(get_job_service)) -> BaseResponse:
    job = job_service.get_by_id(job_id)
    return success_response(
        data=job_service.serialize(job),
        message="Vaga encontrada com sucesso"
    )

@job_controller.post("/", status_code=status.HTTP_201_CREATED, response_model=BaseResponse)
def create(
    job_create : JobCreate,
    token : str = Depends(get_bearer_token),
    company_service : CompanyService = Depends(get_company_service),
    job_service : JobService = Depends(get_job_service),
) -> BaseResponse:
    company_id = get_company_id_from_token(token, company_service)
    job_create.company_id = company_id
    job = job_service.create(job_create)
    return success_response(
        status_code=status.HTTP_201_CREATED,
        data=job_service.serialize(job),
        message="Vaga criada com sucesso"
    )


@job_controller.put("/{job_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def update(
    job_id : uuid.UUID,
    job_update : JobUpdate,
    token : str = Depends(get_bearer_token),
    company_service : CompanyService = Depends(get_company_service),
    job_service : JobService = Depends(get_job_service),
) -> BaseResponse:
    company_id = get_company_id_from_token(token, company_service)
    job = job_service.get_by_id(job_id)
    if job.company_id != company_id:
        from exception.app_exceptions import BadRequest
        raise BadRequest("Esta vaga não pertence à empresa autenticada")

    job = job_service.update(job_id, job_update)
    return success_response(
        data=job_service.serialize(job),
        message="Vaga atualizada com sucesso"
    )


@job_controller.delete("/{job_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def delete(
    job_id : uuid.UUID,
    token : str = Depends(get_bearer_token),
    company_service : CompanyService = Depends(get_company_service),
    job_service : JobService = Depends(get_job_service),
) -> BaseResponse:
    company_id = get_company_id_from_token(token, company_service)
    job = job_service.get_by_id(job_id)
    if job.company_id != company_id:
        from exception.app_exceptions import BadRequest
        raise BadRequest("Esta vaga não pertence à empresa autenticada")

    job_service.delete(job_id)
    return success_response(message="Vaga removida com sucesso")
