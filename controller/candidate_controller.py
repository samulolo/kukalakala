import uuid

from fastapi import APIRouter, Depends, Query, status
from controller.auth.company_auth_controller import get_bearer_token, get_company_id_from_token
from controller.auth.user_auth_controller import get_candidate_id_from_token
from exception.app_exceptions import BadRequest
from schema.candidate.candidate import CandidateUpdate
from service.candidate_service import CandidateService
from service.application_service import ApplicationService
from service.candidate_profile_service import CandidateProfileService
from controller.dependencies import get_application_service, get_candidate_profile_service, get_candidate_service
from domain.application import ApplicationStatus
from schema.app_response import BaseResponse, success_response


candidate_controller = APIRouter(prefix='/api/v1/candidate', tags=['candidate'])



@candidate_controller.get("/", status_code=status.HTTP_200_OK)
def get(
    page : int = Query(1, ge=1),
    limit : int = Query(10, ge=1, le=100),
    token : str = Depends(get_bearer_token),
    candidate_service :CandidateService = Depends(get_candidate_service),
) -> BaseResponse:
    get_company_id_from_token(token)
    candidates = candidate_service.list(page, limit)
    return success_response(
        data=candidates,
        message="Candidatos listados com sucesso"
    )


@candidate_controller.get("/{candidate_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get_by_id(
    candidate_id : uuid.UUID,
    token : str = Depends(get_bearer_token),
    candidate_service :CandidateService = Depends(get_candidate_service),
    application_service : ApplicationService = Depends(get_application_service),
) -> BaseResponse:
    try:
        authenticated_candidate_id = get_candidate_id_from_token(token)
        if authenticated_candidate_id != candidate_id:
            raise BadRequest("Este candidato não pertence à sessão autenticada")
    except BadRequest:
        company_id = get_company_id_from_token(token)
        if not application_service.candidate_has_application_for_company(candidate_id, company_id):
            raise BadRequest("Este candidato não pertence à empresa autenticada")

    candidate = candidate_service.get_by_id(candidate_id)
    return success_response(
        data=candidate_service.serialize(candidate),
        message="Candidato encontrado com sucesso"
    )


@candidate_controller.get("/{candidate_id}/profile", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get_profile(
    candidate_id : uuid.UUID,
    token : str = Depends(get_bearer_token),
    candidate_profile_service : CandidateProfileService = Depends(get_candidate_profile_service),
    application_service : ApplicationService = Depends(get_application_service),
) -> BaseResponse:
    try:
        authenticated_candidate_id = get_candidate_id_from_token(token)
        if authenticated_candidate_id != candidate_id:
            raise BadRequest("Este perfil não pertence à sessão autenticada")
    except BadRequest:
        company_id = get_company_id_from_token(token)
        if not application_service.candidate_has_application_for_company(candidate_id, company_id):
            raise BadRequest("Este perfil não pertence à empresa autenticada")

    candidate_profile = candidate_profile_service.get_by_id(candidate_id)
    return success_response(
        data=candidate_profile_service.serialize(candidate_profile),
        message="Perfil do candidato encontrado com sucesso"
    )


@candidate_controller.get("/{candidate_id}/applications", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get_applications(
    candidate_id : uuid.UUID,
    page : int = Query(1, ge=1),
    limit : int = Query(10, ge=1, le=100),
    status : ApplicationStatus = Query(None),
    token : str = Depends(get_bearer_token),
    application_service : ApplicationService = Depends(get_application_service),
) -> BaseResponse:
    authenticated_candidate_id = get_candidate_id_from_token(token)
    if authenticated_candidate_id != candidate_id:
        raise BadRequest("Estas candidaturas não pertencem à sessão autenticada")

    applications = application_service.list(page, limit, candidate_id=candidate_id, status=status)
    return success_response(
        data=applications,
        message="Candidaturas do candidato listadas com sucesso"
    )


@candidate_controller.put("/{candidate_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def update(
    candidate_id : uuid.UUID,
    candidate_update : CandidateUpdate,
    token : str = Depends(get_bearer_token),
    candidate_service :CandidateService = Depends(get_candidate_service),
) -> BaseResponse:
    authenticated_candidate_id = get_candidate_id_from_token(token)
    if authenticated_candidate_id != candidate_id:
        raise BadRequest("Este candidato não pertence à sessão autenticada")

    candidate = candidate_service.update(candidate_id, candidate_update)
    return success_response(
        data=candidate_service.serialize(candidate),
        message="Candidato atualizado com sucesso"
    )


@candidate_controller.delete("/{candidate_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def delete(
    candidate_id : uuid.UUID,
    token : str = Depends(get_bearer_token),
    candidate_service :CandidateService = Depends(get_candidate_service),
) -> BaseResponse:
    authenticated_candidate_id = get_candidate_id_from_token(token)
    if authenticated_candidate_id != candidate_id:
        raise BadRequest("Este candidato não pertence à sessão autenticada")

    candidate_service.delete(candidate_id)
    return success_response(message="Candidato removido com sucesso")
