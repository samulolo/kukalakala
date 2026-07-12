import uuid

from fastapi import APIRouter, Depends, File, Query, status, UploadFile

from controller.dependencies import get_application_service, get_candidate_profile_service, get_candidate_service, get_company_service
from controller.auth.company_auth_controller import get_bearer_token, get_company_id_from_token
from controller.auth.user_auth_controller import get_candidate_id_from_token
from exception.app_exceptions import BadRequest
from schema.app_response import BaseResponse, success_response
from schema.candidate.candidate_profile import CreateCandidateProfile, UpdateCandidateProfile
from service.candidate_profile_service import CandidateProfileService
from service.application_service import ApplicationService
from service.candidate_service import CandidateService
from service.company_service import CompanyService


profile_controller = APIRouter(prefix='/api/v1/candidate-profile', tags=['Candidate profile'])


@profile_controller.get("/", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get_all(page : int = Query(1, ge=1),
            limit : int = Query(10, ge=1, le=100),
            token : str = Depends(get_bearer_token),
            company_service : CompanyService = Depends(get_company_service),
            candidate_profile_service : CandidateProfileService = Depends(get_candidate_profile_service),) -> BaseResponse:
    get_company_id_from_token(token, company_service)
    candidate_profiles = candidate_profile_service.list(page, limit)
    return success_response(
        data=candidate_profiles,
        message="Perfis de candidatos listados com sucesso"
    )


@profile_controller.get("/{candidate_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def get(candidate_id : uuid.UUID,
         token : str = Depends(get_bearer_token),
         candidate_service : CandidateService = Depends(get_candidate_service),
         company_service : CompanyService = Depends(get_company_service),
         candidate_profile_service : CandidateProfileService = Depends(get_candidate_profile_service),
         application_service : ApplicationService = Depends(get_application_service),) -> BaseResponse:
    try:
        authenticated_candidate_id = get_candidate_id_from_token(token, candidate_service)
        if authenticated_candidate_id != candidate_id:
            raise BadRequest("Este perfil não pertence à sessão autenticada")
    except BadRequest:
        company_id = get_company_id_from_token(token, company_service)
        if not application_service.candidate_has_application_for_company(candidate_id, company_id):
            raise BadRequest("Este perfil não pertence à empresa autenticada")

    candidate_profile = candidate_profile_service.get_by_id(candidate_id)
    return success_response(
        data=candidate_profile_service.serialize(candidate_profile),
        message="Perfil do candidato encontrado com sucesso"
    )


@profile_controller.post("/", status_code=status.HTTP_201_CREATED, response_model=BaseResponse)
def create(candidate_profile_create : CreateCandidateProfile,
            token : str = Depends(get_bearer_token),
            candidate_service : CandidateService = Depends(get_candidate_service),
            candidate_profile_service : CandidateProfileService = Depends(get_candidate_profile_service),) -> BaseResponse:
    candidate_id = get_candidate_id_from_token(token, candidate_service)
    if candidate_id != candidate_profile_create.candidate_id:
        raise BadRequest("Este perfil não pertence à sessão autenticada")

    candidate_profile = candidate_profile_service.create(candidate_profile_create)
    return success_response(
        status_code=status.HTTP_201_CREATED,
        data=candidate_profile_service.serialize(candidate_profile),
        message="Perfil do candidato criado com sucesso"
    )


@profile_controller.put("/{candidate_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def update(
    candidate_id : uuid.UUID,
    candidate_profile_update : UpdateCandidateProfile,
    token : str = Depends(get_bearer_token),
    candidate_service : CandidateService = Depends(get_candidate_service),
    candidate_profile_service : CandidateProfileService = Depends(get_candidate_profile_service),
) -> BaseResponse:
    authenticated_candidate_id = get_candidate_id_from_token(token, candidate_service)
    if authenticated_candidate_id != candidate_id:
        raise BadRequest("Este perfil não pertence à sessão autenticada")

    candidate_profile = candidate_profile_service.update(candidate_id, candidate_profile_update)
    return success_response(
        data=candidate_profile_service.serialize(candidate_profile),
        message="Perfil do candidato atualizado com sucesso"
    )


@profile_controller.delete("/{candidate_id}", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def delete(
    candidate_id : uuid.UUID,
    token : str = Depends(get_bearer_token),
    candidate_service : CandidateService = Depends(get_candidate_service),
    candidate_profile_service : CandidateProfileService = Depends(get_candidate_profile_service),
) -> BaseResponse:
    authenticated_candidate_id = get_candidate_id_from_token(token, candidate_service)
    if authenticated_candidate_id != candidate_id:
        raise BadRequest("Este perfil não pertence à sessão autenticada")

    candidate_profile_service.delete(candidate_id)
    return success_response(message="Perfil do candidato removido com sucesso")


@profile_controller.post("/{candidate_id}/upload/cv", status_code=status.HTTP_200_OK, response_model=BaseResponse)
async def upload_cv(candidate_id : uuid.UUID,
                    file : UploadFile = File(...),
                    token : str = Depends(get_bearer_token),
                    candidate_service : CandidateService = Depends(get_candidate_service),
                    candidate_profile_service : CandidateProfileService = Depends(get_candidate_profile_service),) -> BaseResponse:
    authenticated_candidate_id = get_candidate_id_from_token(token, candidate_service)
    if authenticated_candidate_id != candidate_id:
        raise BadRequest("Este perfil não pertence à sessão autenticada")

    file_data = await file.read()
    upload_data = candidate_profile_service.upload_cv(
        candidate_id=candidate_id,
        filename=file.filename,
        content_type=file.content_type,
        file_data=file_data
    )
    return success_response(
        data=upload_data,
        message="CV carregado com sucesso"
    )
