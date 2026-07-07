from datetime import datetime

from pydantic import BaseModel, ConfigDict
import uuid
from typing import Optional, List
from domain.candidate_profile import ProfessionalSituationStatus


class CreateCandidateProfile(BaseModel):

    candidate_id : uuid.UUID
    experience_years : Optional[int] = 0
    professional_situation : ProfessionalSituationStatus = ProfessionalSituationStatus.UNEMPLOYED
    key_competences : Optional[List[str]]


class UpdateCandidateProfile(BaseModel):

    experience_years : Optional[int] = None
    professional_situation : Optional[ProfessionalSituationStatus] = None
    key_competences : Optional[List[str]] = None


class CandidateProfileResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    candidate_id : uuid.UUID
    experience_years : Optional[int] = None
    resume_url : Optional[str] = None
    professional_situation : Optional[ProfessionalSituationStatus] = None
    key_competences : Optional[List[str]] = None
    created_at : datetime
    updated_at : datetime
