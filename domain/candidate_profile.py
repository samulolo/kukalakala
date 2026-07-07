from sqlmodel import SQLModel, Field, Relationship, ARRAY, String, Text
from typing import List, Optional
import uuid
from enum import Enum
from datetime import datetime, timezone
from exception.app_exceptions import BadRequest
from utils.util import not_negative


class ProfessionalSituationStatus(Enum):

    EMPLOYED = 'employed'
    UNEMPLOYED = 'unempoyed'


PrefessionalSituationStatus = ProfessionalSituationStatus


class CandidateProfile(SQLModel, table = True):

    __tablename__ = 'candidates_profile'

    candidate_id : uuid.UUID = Field(primary_key=True, foreign_key='candidates.id', nullable=False, unique=True)
    experience_years : int = Field(nullable=True, max_digits=3)
    resume_url : str = Field(nullable=True, sa_type=Text)
    resume_text : Optional[str] = Field(default=None, nullable=True, sa_type=Text)
    # Vou assumir que por padrão o candidato está desempregado
    professional_situation : ProfessionalSituationStatus  = Field(default=ProfessionalSituationStatus.UNEMPLOYED, nullable=True)
    key_competences : Optional[List[str]] = Field(nullable=True, sa_type=ARRAY(String))
    created_at : datetime = Field(default_factory=lambda : datetime.now(timezone.utc))
    updated_at : datetime = Field(default_factory=lambda : datetime.now(timezone.utc))

    candidate : Optional['Candidate'] = Relationship(back_populates='professional_profile')


    def resume_should_be_pdf(self, filename : str):

        if not filename or not filename.lower().endswith(".pdf"):
            raise BadRequest("O currículo deve estar no formato PDF")

        return True

    def should_have_cv_to_apply(self):

        if not self.resume_url:
            raise BadRequest("É necessário submeter o curriculo para aplicar para essa vaga")

        return True

    def experience_not_negative(self):

        if self.experience_years is not None and not not_negative(self.experience_years):
            raise BadRequest("O ano de experiência não pode ser um valor negativo")

        return True
