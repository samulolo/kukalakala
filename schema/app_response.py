from datetime import datetime, timezone
from typing import Any, Optional

from fastapi import status
from pydantic import BaseModel, Field



class BaseResponse(BaseModel):
    status: int = status.HTTP_200_OK
    data: Optional[Any] = None
    message: Optional[str] = None
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


def success_response(
    data: Optional[Any] = None,
    message: Optional[str] = None,
    status_code: int = status.HTTP_200_OK,
) -> BaseResponse:
    return BaseResponse(status=status_code, data=data, message=message)


def error_response(
    message: str,
    status_code: int,
    data: Optional[Any] = None,
) -> BaseResponse:
    return BaseResponse(status=status_code, data=data, message=message)
