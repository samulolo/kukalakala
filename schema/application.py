from datetime import datetime
from typing import Optional
import uuid

from pydantic import BaseModel, ConfigDict

from domain.application import ApplicationStatus


class ApplicationCreate(BaseModel):

    candidate_id : uuid.UUID
    job_id : uuid.UUID
    status : ApplicationStatus = ApplicationStatus.SUBMITTED
    ai_score : Optional[float] = None
    ai_suggestions : Optional[str] = None


class ApplicationUpdate(BaseModel):

    status : Optional[ApplicationStatus] = None
    ai_score : Optional[float] = None
    ai_suggestions : Optional[str] = None


class ApplicationDecisionUpdate(BaseModel):

    status : ApplicationStatus
    message : Optional[str] = None


class ApplicationMessageResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id : uuid.UUID
    application_id : uuid.UUID
    candidate_id : uuid.UUID
    company_id : uuid.UUID
    status : ApplicationStatus
    message : str
    channel : str
    delivery_status : str
    created_at : datetime
    sent_at : Optional[datetime] = None


class ApplicationResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id : uuid.UUID
    candidate_id : uuid.UUID
    job_id : uuid.UUID
    applied_at : datetime
    status : ApplicationStatus
    ai_score : Optional[float] = None
    updated_at : datetime
    ai_suggestions : Optional[str] = None
