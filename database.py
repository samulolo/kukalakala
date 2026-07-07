from sqlalchemy import inspect, text
from sqlmodel import create_engine, SQLModel, Session
from core.setting import get_settings, Settings
from fastapi import Depends
from typing import Annotated


setting : Settings = get_settings()

DATABASE_URL = setting.database_url

engine = create_engine(DATABASE_URL)



def create_table():
    SQLModel.metadata.create_all(engine)
    ensure_candidate_password_hash_column()
    ensure_company_auth_columns()


def ensure_candidate_password_hash_column():
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    if "candidates" not in table_names:
        return

    column_names = {column["name"] for column in inspector.get_columns("candidates")}
    if "password_hash" in column_names:
        return

    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE candidates ADD COLUMN password_hash VARCHAR"))


def ensure_company_auth_columns():
    inspector = inspect(engine)
    table_names = inspector.get_table_names()

    if "companies" not in table_names:
        return

    column_names = {column["name"] for column in inspector.get_columns("companies")}

    with engine.begin() as connection:
        if "email" not in column_names:
            connection.execute(text("ALTER TABLE companies ADD COLUMN email VARCHAR"))
            connection.execute(text("UPDATE companies SET email = CONCAT('company-', id, '@kukalakala.local') WHERE email IS NULL OR email = ''"))
            connection.execute(text("ALTER TABLE companies ALTER COLUMN email SET NOT NULL"))
            connection.execute(text("CREATE UNIQUE INDEX IF NOT EXISTS ix_companies_email ON companies (email)"))

        if "password_hash" not in column_names:
            connection.execute(text("ALTER TABLE companies ADD COLUMN password_hash VARCHAR"))


def get_db_session():
    with Session(engine) as session:
        yield session



session_db = Annotated[Session, Depends(get_db_session)]
