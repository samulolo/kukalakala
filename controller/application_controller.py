import uuid

from fastapi import APIRouter, Depends, Query, status

from controller.dependencies import get_application_service
from controller.auth.company_auth_controller import get_bearer_token, get_company_id_from_token
from controller.auth.user_auth_controller import get_candidate_id_from_token
from exception.app_exceptions import BadRequest
from domain.application import ApplicationStatus
from schema.app_response import BaseResponse, success_response
from schema.application import ApplicationCreate, ApplicationDecisionUpdate, ApplicationUpdate
from service.application_service import ApplicationService


application_controller = APIRouter(prefix="/api/v1/application", tags=["application"])


@application_controller.get("/", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get_all(
    page : int = Query(1, ge=1),
    limit : int = Query(10, ge=1, le=100),
    candidate_id : uuid.UUID = Query(None),
    job_id : uuid.UUID = Query(None),
    status : ApplicationStatus = Query(None),
    token : str = Depends(get_bearer_token),
    application_service : ApplicationService = Depends(get_application_service),
) -> BaseResponse:
    try:
        candidate_from_token = get_candidate_id_from_token(token)
        if candidate_id is None:
            candidate_id = candidate_from_token
        elif candidate_id != candidate_from_token:
            raise BadRequest("Esta candidatura não pertence ao candidato autenticado")
        applications = application_service.list(page, limit, candidate_id, job_id, status)
    except BadRequest:
        company_id = get_company_id_from_token(token)
        if not job_id:
            raise BadRequest("Informe a vaga para listar candidaturas da empresa")
        applications = application_service.list_for_company_job(page, limit, job_id=job_id, company_id=company_id, status=status)

    return success_response(
        data=applications,
        message="Candidaturas listadas com sucesso"
    )


@application_controller.get("/candidate/{candidate_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get_by_candidate(
    candidate_id : uuid.UUID,
    page : int = Query(1, ge=1),
    limit : int = Query(10, ge=1, le=100),
    status : ApplicationStatus = Query(None),
    token : str = Depends(get_bearer_token),
    application_service : ApplicationService = Depends(get_application_service),
) -> BaseResponse:
    candidate_from_token = get_candidate_id_from_token(token)
    if candidate_from_token != candidate_id:
        raise BadRequest("Esta candidatura não pertence ao candidato autenticado")

    applications = application_service.list(page, limit, candidate_id=candidate_id, status=status)
    return success_response(
        data=applications,
        message="Candidaturas do candidato listadas com sucesso"
    )


@application_controller.get("/job/{job_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get_by_job(
    job_id : uuid.UUID,
    page : int = Query(1, ge=1),
    limit : int = Query(10, ge=1, le=100),
    status : ApplicationStatus = Query(None),
    token : str = Depends(get_bearer_token),
    application_service : ApplicationService = Depends(get_application_service),
) -> BaseResponse:
    company_id = get_company_id_from_token(token)
    applications = application_service.list_for_company_job(page, limit, job_id=job_id, company_id=company_id, status=status)
    return success_response(
        data=applications,
        message="Candidaturas da vaga listadas com sucesso"
    )


@application_controller.get("/{application_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get(application_id : uuid.UUID, application_service : ApplicationService = Depends(get_application_service)) -> BaseResponse:
    application = application_service.get_by_id(application_id)
    return success_response(
        data=application_service.serialize(application),
        message="Candidatura encontrada com sucesso"
    )


@application_controller.get("/{application_id}/messages", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get_messages(
    application_id : uuid.UUID,
    token : str = Depends(get_bearer_token),
    application_service : ApplicationService = Depends(get_application_service),
) -> BaseResponse:
    company_id = get_company_id_from_token(token)
    messages = application_service.list_messages_for_company(application_id, company_id)
    return success_response(
        data=messages,
        message="Histórico da candidatura listado com sucesso"
    )


@application_controller.post("/", status_code=status.HTTP_201_CREATED, response_model=BaseResponse)
def create(
    application_create : ApplicationCreate,
    token : str = Depends(get_bearer_token),
    application_service : ApplicationService = Depends(get_application_service),
) -> BaseResponse:
    candidate_id = get_candidate_id_from_token(token)
    if candidate_id != application_create.candidate_id:
        raise BadRequest("Esta candidatura não pertence ao candidato autenticado")

    application = application_service.create(application_create)
    return success_response(
        status_code=status.HTTP_201_CREATED,
        data=application_service.serialize(application),
        message="Candidatura criada com sucesso"
    )


@application_controller.put("/{application_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def update(application_id : uuid.UUID, application_update : ApplicationUpdate, application_service : ApplicationService = Depends(get_application_service)) -> BaseResponse:
    application = application_service.update(application_id, application_update)
    return success_response(
        data=application_service.serialize(application),
        message="Candidatura atualizada com sucesso"
    )


@application_controller.patch("/{application_id}/company-decision", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def company_decision(
    application_id : uuid.UUID,
    application_decision : ApplicationDecisionUpdate,
    token : str = Depends(get_bearer_token),
    application_service : ApplicationService = Depends(get_application_service),
) -> BaseResponse:
    company_id = get_company_id_from_token(token)
    application = application_service.update_company_decision(
        application_id=application_id,
        company_id=company_id,
        status=application_decision.status,
        message=application_decision.message,
    )
    return success_response(
        data=application,
        message="Decisão da candidatura registada com sucesso"
    )


@application_controller.delete("/{application_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def delete(application_id : uuid.UUID, application_service : ApplicationService = Depends(get_application_service)) -> BaseResponse:
    application_service.delete(application_id)
    return success_response(message="Candidatura removida com sucesso")
