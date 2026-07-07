from pydantic import (BaseModel, field_validator,
                     ConfigDict, ValidationInfo)
from typing import Optional
import re
import uuid

EMAIL_REGEX = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$"


class CandidateCreate(BaseModel):

    name : str
    email : str
    password : str
    # phone_number : str = None


    @field_validator("name","email","password", mode="after")
    @classmethod
    def check_fields(cls, value : str, info : ValidationInfo):

        if not value.strip() or value.strip() == '':
            raise ValueError(f"O campo {info.field_name} não pode estar vazio")
        return value

    @field_validator("email", mode='after')
    @classmethod
    def validate_email(cls, value : str):

        if not re.search(EMAIL_REGEX, value):
            raise ValueError("O email está em um formato incorreto, informe um formato válido")
        return value

    @field_validator("password", mode='after')
    @classmethod
    def validate_password(cls, value : str):

        if len(value) < 8:
            raise ValueError("A palavra-passe deve ter pelo menos 8 caracteres")
        return value


class CandidateLogin(BaseModel):

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
    def check_email(cls, value : str):

        if not re.search(EMAIL_REGEX, value):
            raise ValueError("O email está em um formato incorreto, informe um formato válido")

        return value

class CandidateUpdate(BaseModel):

    name : Optional[str] = None
    email : Optional[str] = None

    @field_validator("email", mode='after')
    @classmethod
    def validate_email(cls, value : Optional[str]):

        if value:
            if not re.search(EMAIL_REGEX, value):
                 raise ValueError("O email está em um formato incorreto, informe um formato válido")
        return value


class CandidateResponse(BaseModel):

    model_config = ConfigDict(from_attributes=True)

    id : uuid.UUID
    name : str
    email : str
