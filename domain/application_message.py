from datetime import datetime, timezone
from typing import Optional
import uuid

from sqlmodel import Field, SQLModel, Text

from domain.application import ApplicationStatus


class ApplicationMessage(SQLModel, table=True):

    __tablename__ = "application_messages"

    id : uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    application_id : uuid.UUID = Field(foreign_key="applications.id", nullable=False, index=True)
    candidate_id : uuid.UUID = Field(foreign_key="candidates.id", nullable=False, index=True)
    company_id : uuid.UUID = Field(foreign_key="companies.id", nullable=False, index=True)
    status : ApplicationStatus = Field(nullable=False)
    message : str = Field(nullable=False, sa_type=Text)
    channel : str = Field(default="internal", nullable=False)
    delivery_status : str = Field(default="simulated", nullable=False)
    created_at : datetime = Field(default_factory=lambda : datetime.now(timezone.utc), nullable=False)
    sent_at : Optional[datetime] = Field(default_factory=lambda : datetime.now(timezone.utc), nullable=True)
