from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from exception.app_exceptions import BadRequest, ResourceAlreadyExists, ResourceNotFound
from schema.app_response import error_response



def global_exceptions(app : FastAPI):

    @app.exception_handler(ResourceAlreadyExists)
    def handle_resource_exist_error(request : Request , exc : ResourceAlreadyExists):
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content=error_response(
                status_code=status.HTTP_409_CONFLICT,
                message=str(exc),
            ).model_dump(mode="json")
        )

    @app.exception_handler(ResourceNotFound)
    def handle_resource_not_found_error(request : Request , exc : ResourceNotFound):
        return JSONResponse(
            status_code=status.HTTP_404_NOT_FOUND,
            content=error_response(
                status_code=status.HTTP_404_NOT_FOUND,
                message=str(exc),
            ).model_dump(mode="json")
        )

    @app.exception_handler(BadRequest)
    def handle_bad_request_error(request : Request , exc : BadRequest):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=error_response(
                status_code=status.HTTP_400_BAD_REQUEST,
                message=str(exc),
            ).model_dump(mode="json")
        )

    @app.exception_handler(RequestValidationError)
    def handle_validation_error(request: Request, exc: RequestValidationError):
        errors = []
        for error in exc.errors():
            sanitized_error = dict(error)
            if "ctx" in sanitized_error:
                sanitized_error["ctx"] = {
                    key: str(value)
                    for key, value in sanitized_error["ctx"].items()
                }
            errors.append(sanitized_error)

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=error_response(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                message="Dados inválidos",
                data=errors,
            ).model_dump(mode="json")
        )

    @app.exception_handler(HTTPException)
    def handle_http_error(request: Request, exc: HTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response(
                status_code=exc.status_code,
                message=str(exc.detail),
            ).model_dump(mode="json")
        )

    @app.exception_handler(Exception)
    def handle_unexpected_error(request: Request, exc: Exception):
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Erro interno do servidor",
            ).model_dump(mode="json")
        )
