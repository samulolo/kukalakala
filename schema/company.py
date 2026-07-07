from datetime import date, datetime
from typing import Optional
import uuid

from pydantic import BaseModel, ConfigDict, field_validator, ValidationInfo

from schema.candidate.candidate import EMAIL_REGEX
import re


class CompanyCreate(BaseModel):

    name : str
    email : str
    password : str
    sector : str
    location : str
    foundation_date : Optional[date] = None

    @field_validator("name","email","password","sector","location", mode="after")
    @classmethod
    def check_fields(cls, value : str, info : ValidationInfo):

        if not value.strip() or value.strip() == "":
            raise ValueError(f"O campo {info.field_name} não pode estar vazio")
        return value

    @field_validator("email", mode="after")
    @classmethod
    def validate_email(cls, value : str):

        if not re.search(EMAIL_REGEX, value):
            raise ValueError("O email está em um formato incorreto, informe um formato válido")
        return value

    @field_validator("password", mode="after")
    @classmethod
    def validate_password(cls, value : str):

        if len(value) < 8:
            raise ValueError("A palavra-passe deve ter pelo menos 8 caracteres")
        return value


class CompanyLogin(BaseModel):

    email : str
    password : str

    @field_validator("email","password", mode="after")
    @classmethod
    def check_fields(cls, value : str, info : ValidationInfo):

        if not value.strip() or value.strip() == "":
            raise ValueError(f"O campo {info.field_name} não pode estar vazio")
        return value

    @field_validator("email", mode="after")
    @classmethod
    def validate_email(cls, value : str):

        if not re.search(EMAIL_REGEX, value):
            raise ValueError("O email está em um formato incorreto, informe um formato válido")
        return value


class CompanyUpdate(BaseModel):

    name : Optional[str] = None
    email : Optional[str] = None
    sector : Optional[str] = None
    location : Optional[str] = None
    foundation_date : Optional[date] = None


class CompanyResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id : uuid.UUID
    name : str
    email : str
    sector : str
    location : str
    foundation_date : Optional[date] = None
    created_at : datetime
    updated_at : datetime
