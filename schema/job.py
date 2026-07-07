from datetime import datetime
from typing import List, Optional
import uuid

from pydantic import BaseModel, ConfigDict

from domain.job import JobType


class JobCompanyResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id : uuid.UUID
    name : str
    sector : str
    location : str


class JobCreate(BaseModel):

    company_id : uuid.UUID
    title : str
    description : str
    requirements : Optional[List[str]] = None
    is_active : bool = True
    application_period_start : datetime
    application_period_end : datetime
    type : JobType
    response_time : Optional[int] = None


class JobCreateWithoutCompany(BaseModel):

    title : str
    description : str
    requirements : Optional[List[str]] = None
    is_active : bool = True
    application_period_start : datetime
    application_period_end : datetime
    type : JobType
    response_time : Optional[int] = None

    def to_job_create(self, company_id : uuid.UUID) -> JobCreate:
        return JobCreate(
            company_id=company_id,
            **self.model_dump()
        )


class JobUpdate(BaseModel):

    company_id : Optional[uuid.UUID] = None
    title : Optional[str] = None
    description : Optional[str] = None
    requirements : Optional[List[str]] = None
    is_active : Optional[bool] = None
    application_period_start : Optional[datetime] = None
    application_period_end : Optional[datetime] = None
    type : Optional[JobType] = None
    response_time : Optional[int] = None


class JobResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id : uuid.UUID
    company_id : uuid.UUID
    title : str
    description : str
    requirements : Optional[List[str]] = None
    created_at : datetime
    updated_at : datetime
    is_active : bool
    application_period_start : datetime
    application_period_end : datetime
    type : JobType
    response_time : Optional[int] = None
    company : Optional[JobCompanyResponse] = None
