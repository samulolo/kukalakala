import uuid

from schema.candidate.candidate import CandidateCreate, CandidateLogin, CandidateResponse, CandidateUpdate
from domain.candidate import Candidate
from repository.candidate_repository import CandidateRepository
from exception.app_exceptions import BadRequest, ResourceAlreadyExists, ResourceNotFound
from schema.pagination import paginate_response, serialize_response
from service.password_service import hash_password, verify_password

class CandidateService:


    def __init__(self, candidate_repository : CandidateRepository):
        self.candidate_repository = candidate_repository


    def _ensure_user_exits(self, email : str):

        exist_candidate = self.candidate_repository.get_by_email(email)
        if not exist_candidate:
            return False
        return True

    def list(self, page : int, limit : int):
        offset = (page - 1) * limit
        candidates, total = self.candidate_repository.list(offset, limit)
        return paginate_response(candidates, total, page, limit, CandidateResponse)

    def serialize(self, candidate : Candidate):
        return serialize_response(candidate, CandidateResponse)

    def get_by_id(self, candidate_id : uuid.UUID):

        candidate = self.candidate_repository.get_by_id(candidate_id)

        if not candidate:
            raise ResourceNotFound("Candidato não encontrado")

        return candidate

    def get_by_email(self, email : str):
        candidate = self.candidate_repository.get_by_email(email)

        if not candidate:
            raise ResourceNotFound("Candidato não encontrado")

        return candidate

    def get_or_create_from_auth(self, email : str, name : str = None):
        candidate = self.candidate_repository.get_by_email(email)

        if candidate:
            return candidate

        return self.candidate_repository.save(
            Candidate(
                name=name or email,
                email=email,
            )
        )


    def create(self, candidate_create : CandidateCreate):

        if  self._ensure_user_exits(candidate_create.email):
            raise ResourceAlreadyExists("Já existe uma conta com esse email")

        candidate_data = candidate_create.model_dump(exclude={"password"})
        new_candidate = Candidate(
            **candidate_data,
            password_hash=hash_password(candidate_create.password),
        )

        return  self.candidate_repository.save(new_candidate)


    def login(self, candidate_login : CandidateLogin):

        candidate = self.candidate_repository.get_by_email(candidate_login.email)

        if not candidate:
            raise BadRequest("Email ou palavra-passe inválidos")

        if not verify_password(candidate_login.password, candidate.password_hash):
            raise BadRequest("Email ou palavra-passe inválidos")

        return candidate



    def update(self, candidate_id : uuid.UUID, candidate_update : CandidateUpdate):

        candidate = self.candidate_repository.get_by_id(candidate_id)

        if not candidate:
            raise ResourceNotFound("Candidato não encontrado")

        update_data = candidate_update.model_dump(exclude_none=True)

        if "email" in update_data:
            exist_candidate = self.candidate_repository.get_by_email(update_data["email"])
            if exist_candidate and exist_candidate.id != candidate.id:
                raise ResourceAlreadyExists("Já existe uma conta com esse email")

        for field, value in update_data.items():
            if value:
                setattr(candidate, field, value)

        return self.candidate_repository.save(candidate)


    def delete(self, candidate_id : uuid.UUID):

        candidate = self.candidate_repository.get_by_id(candidate_id)

        if not candidate:
            raise ResourceNotFound("Candidato não encontrado")

        self.candidate_repository.delete(candidate)
