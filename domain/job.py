from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
import uuid

from sqlmodel import ARRAY, Field, Relationship, SQLModel, String, Text
from exception.app_exceptions import BadRequest
from utils.util import not_negative


class JobType(Enum):

    ON_SITE = "on_site"
    REMOTE = "remote"
    HYBRID = "hybrid"


class Job(SQLModel, table=True):

    __tablename__ = "jobs"

    id : uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    company_id : uuid.UUID = Field(foreign_key="companies.id", nullable=False, index=True)
    title : str = Field(nullable=False, index=True)
    description : str = Field(nullable=False, sa_type=Text)
    requirements : Optional[List[str]] = Field(nullable=True, sa_type=ARRAY(String))
    created_at : datetime = Field(default_factory=lambda : datetime.now(timezone.utc))
    updated_at : datetime = Field(default_factory=lambda : datetime.now(timezone.utc))
    is_active : bool = Field(default=True)
    application_period_start : datetime = Field(nullable=False)
    application_period_end : datetime = Field(nullable=False)
    type : JobType = Field(nullable=False)
    response_time : Optional[int] = Field(default=None, nullable=True)

    company : Optional["Company"] = Relationship(back_populates="jobs")
    applications : Optional[List["Application"]] = Relationship(back_populates="job")

    def _as_utc(self, value : datetime):

        if value.tzinfo is None:
            return value.replace(tzinfo=timezone.utc)

        return value.astimezone(timezone.utc)


    def can_receive_applications(self, application_date : datetime):

        if not self.is_active:
            raise BadRequest("A vaga não está ativa para receber candidaturas")

        application_date = self._as_utc(application_date)
        application_period_start = self._as_utc(self.application_period_start)
        application_period_end = self._as_utc(self.application_period_end)

        if application_date < application_period_start or application_date > application_period_end:
            raise BadRequest("A data da candidatura está fora do período de aplicações da vaga")

        return True


    def application_end_not_lower_than_start(self):

        application_period_start = self._as_utc(self.application_period_start)
        application_period_end = self._as_utc(self.application_period_end)

        if application_period_end < application_period_start:
            raise BadRequest("A data do fim não pode ser inferior a data de inicío")

        return True

    def response_time_not_negative(self):

        if self.response_time is not None and not not_negative(self.response_time):
            raise BadRequest("O tempo de resposta não pode ser negativo")

        return True
