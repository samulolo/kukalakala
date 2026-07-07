import uuid

from fastapi import APIRouter, Depends, Header, status

from controller.dependencies import get_application_service, get_candidate_profile_service, get_candidate_service
from exception.app_exceptions import BadRequest, ResourceNotFound
from schema.app_response import BaseResponse, success_response
from schema.application import ApplicationCreate
from schema.auth import auth_payload
from domain.application import ApplicationStatus
from schema.candidate.candidate import CandidateCreate, CandidateLogin
from service.candidate_profile_service import CandidateProfileService
from service.application_service import ApplicationService
from service.auth_token_service import AuthTokenService
from service.candidate_service import CandidateService


candidate_auth_controller = APIRouter(prefix="/api/v1/candidate-auth", tags=["candidate auth"])


def get_bearer_token(authorization : str = Header(None)) -> str:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise BadRequest("Sessão inválida ou expirada")

    return authorization.split(" ", 1)[1].strip()


def get_candidate_id_from_token(token : str) -> uuid.UUID:
    payload = AuthTokenService().verify_access_token(token)

    if not payload or payload.get("role") != "candidate":
        raise BadRequest("Sessão inválida ou expirada")

    try:
        return uuid.UUID(payload["sub"])
    except (TypeError, ValueError):
        raise BadRequest("Sessão inválida ou expirada")


@candidate_auth_controller.post("/register", status_code=status.HTTP_201_CREATED, response_model=BaseResponse)
def register(candidate_create : CandidateCreate, candidate_service : CandidateService = Depends(get_candidate_service)) -> BaseResponse:
    candidate = candidate_service.create(candidate_create)
    serialized_candidate = candidate_service.serialize(candidate)
    token_data = AuthTokenService().create_access_token(str(candidate.id))
    return success_response(
        status_code=status.HTTP_201_CREATED,
        data=auth_payload(serialized_candidate, token_data),
        message="Candidato criado com sucesso"
    )


@candidate_auth_controller.post("/login", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def login(candidate_login : CandidateLogin, candidate_service : CandidateService = Depends(get_candidate_service)) -> BaseResponse:
    candidate = candidate_service.login(candidate_login)
    serialized_candidate = candidate_service.serialize(candidate)
    token_data = AuthTokenService().create_access_token(str(candidate.id))
    return success_response(
        data=auth_payload(serialized_candidate, token_data),
        message="Login realizado com sucesso"
    )


@candidate_auth_controller.get("/me", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def me(
    token : str = Depends(get_bearer_token),
    candidate_service : CandidateService = Depends(get_candidate_service),
) -> BaseResponse:
    candidate_id = get_candidate_id_from_token(token)
    candidate = candidate_service.get_by_id(candidate_id)
    if not candidate:
        raise ResourceNotFound("Candidato não encontrado")

    return success_response(
        data=candidate_service.serialize(candidate),
        message="Sessão válida"
    )


@candidate_auth_controller.get("/me/messages", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def my_messages(
    token : str = Depends(get_bearer_token),
    application_service : ApplicationService = Depends(get_application_service),
) -> BaseResponse:
    candidate_id = get_candidate_id_from_token(token)
    messages = application_service.list_candidate_messages(candidate_id)

    return success_response(
        data=messages,
        message="Mensagens do candidato listadas com sucesso"
    )


@candidate_auth_controller.get("/me/profile", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def my_profile(
    token : str = Depends(get_bearer_token),
    candidate_profile_service : CandidateProfileService = Depends(get_candidate_profile_service),
) -> BaseResponse:
    candidate_id = get_candidate_id_from_token(token)
    profile = candidate_profile_service.get_by_id(candidate_id)

    return success_response(
        data=candidate_profile_service.serialize(profile),
        message="Perfil do candidato encontrado com sucesso"
    )


@candidate_auth_controller.get("/me/applications", status_code=status.HTTP_200_OK, response_model=BaseResponse)
def my_applications(
    page : int = 1,
    limit : int = 10,
    status : ApplicationStatus = None,
    token : str = Depends(get_bearer_token),
    application_service : ApplicationService = Depends(get_application_service),
) -> BaseResponse:
    candidate_id = get_candidate_id_from_token(token)
    applications = application_service.list(page, limit, candidate_id=candidate_id, status=status)

    return success_response(
        data=applications,
        message="Candidaturas do candidato listadas com sucesso"
    )


@candidate_auth_controller.post("/me/applications/{job_id}", status_code=status.HTTP_201_CREATED, response_model=BaseResponse)
def apply_to_job(
    job_id : uuid.UUID,
    token : str = Depends(get_bearer_token),
    application_service : ApplicationService = Depends(get_application_service),
) -> BaseResponse:
    candidate_id = get_candidate_id_from_token(token)
    application = application_service.create(
        ApplicationCreate(
            candidate_id=candidate_id,
            job_id=job_id,
        )
    )

    return success_response(
        status_code=status.HTTP_201_CREATED,
        data=application_service.serialize(application),
        message="Candidatura criada com sucesso"
    )
