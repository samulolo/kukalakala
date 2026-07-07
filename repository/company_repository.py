from sqlalchemy import func
from sqlmodel import Session, select
from domain.company import Company
import uuid


class CompanyRepository:

    def __init__(self, db_session : Session):
        self.db = db_session

    def get_by_id(self, company_id : uuid.UUID):
        return self.db.get(Company, company_id)

    def get_by_email(self, email : str):
        return self.db.exec(select(Company).where(Company.email == email)).first()

    def list(self, offset : int, limit : int):
        items = self.db.exec(select(Company).offset(offset).limit(limit)).all()
        total = self.db.exec(select(func.count()).select_from(Company)).one()
        return items, total

    def save(self, company : Company) -> Company:

        self.db.add(company)
        self.db.commit()
        self.db.refresh(company)

        return company

    def delete(self, company : Company):
        self.db.delete(company)
        self.db.commit()
