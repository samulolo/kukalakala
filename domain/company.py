from datetime import date, datetime, timezone
from typing import List, Optional
import uuid
from exception.app_exceptions import BadRequest
from sqlmodel import Field, Relationship, SQLModel


class Company(SQLModel, table=True):

    __tablename__ = "companies"

    id : uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name : str = Field(nullable=False, index=True)
    email : str = Field(default="", nullable=False, unique=True, index=True)
    password_hash : Optional[str] = Field(default=None, nullable=True)
    sector : str = Field(nullable=False)
    location : str = Field(nullable=False)
    foundation_date : date = Field(nullable=True)
    created_at : datetime = Field(default_factory=lambda : datetime.now(timezone.utc))
    updated_at : datetime = Field(default_factory=lambda : datetime.now(timezone.utc))

    jobs : Optional[List["Job"]] = Relationship(back_populates="company")


    def foundation_not_in_future(self):

        today = datetime.now(timezone.utc).date()

        if self.foundation_date and self.foundation_date > today:
            raise BadRequest("A data de fundação da empresa não pode estar no futuro")

        return True
