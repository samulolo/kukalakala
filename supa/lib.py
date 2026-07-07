import httpx
from storage3.exceptions import StorageApiError

from core.setting import get_settings
from exception.app_exceptions import BadRequest
from supabase import Client, create_client


settings = get_settings()


def get_supabase_client() -> Client:

    if not settings.supabase_url:
        raise BadRequest("SUPABASE_URL não está configurado")

    supabase_key = settings.supabase_service_role or settings.supabase_key
    if not supabase_key:
        raise BadRequest("A chave do Supabase não está configurada")

    return create_client(
        supabase_key=supabase_key,
        supabase_url=settings.supabase_url.strip()
    )


def send_cv_to_supa(file_path : str, storage_path : str, bucket_name : str = "resumes"):

    try:
        with open(file_path, "rb") as file:
            response = get_supabase_client().storage.from_(bucket_name).upload(
                path=storage_path,
                file=file,
                file_options={
                    "content-type": "application/pdf",
                    "x-upsert": "true"
                }
            )
    except StorageApiError as exc:
        raise BadRequest(f"Não foi possível enviar o currículo para o Supabase: {exc.message}") from exc
    except httpx.ConnectError as exc:
        print("ERRO: ", str(exc))
        raise BadRequest(
            "Não foi possível conectar ao Supabase. Confirma se SUPABASE_URL está correto e se o projeto está ativo."
        ) from exc
    except Exception as exc:
        raise BadRequest(f"Não foi possível enviar o currículo para o Supabase: {exc}") from exc

    return {
        "bucket": bucket_name,
        "path": storage_path,
        "response": response
    }
