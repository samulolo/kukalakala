from datetime import datetime, timezone
from enum import Enum
from typing import Optional
import uuid

from sqlmodel import Field, Relationship, SQLModel, Text
from exception.app_exceptions import BadRequest


class ApplicationStatus(Enum):

    SUBMITTED = "submetida"
    IN_REVIEW = "em_analise"
    INTERVIEW = "entrevista"
    APPROVED = "aprovada"
    REJECTED = "rejeitada"


class Application(SQLModel, table=True):

    __tablename__ = "applications"

    id : uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    candidate_id : uuid.UUID = Field(foreign_key="candidates.id", nullable=False, index=True)
    job_id : uuid.UUID = Field(foreign_key="jobs.id", nullable=False, index=True)
    applied_at : datetime = Field(default_factory=lambda : datetime.now(timezone.utc))
    status : ApplicationStatus = Field(default=ApplicationStatus.SUBMITTED, nullable=False)
    ai_score : Optional[float] = Field(default=None, nullable=True)
    updated_at : datetime = Field(default_factory=lambda : datetime.now(timezone.utc))
    ai_suggestions : Optional[str] = Field(default=None, nullable=True, sa_type=Text)

    candidate : Optional["Candidate"] = Relationship(back_populates="applications")
    job : Optional["Job"] = Relationship(back_populates="applications")


    def can_apply(self):
        self.ai_score_must_be_between_zero_and_one_hundred()
        return True

    def ai_score_must_be_between_zero_and_one_hundred(self):

        if self.ai_score is not None and (self.ai_score < 0 or self.ai_score > 100):
            raise BadRequest("O score da IA deve estar entre 0 e 100 inclusive")

        return True
