from sqlalchemy import func
from sqlmodel import Session, select
from domain.candidate import Candidate
import uuid

class CandidateRepository:

    def __init__(self, db_session : Session):
        self.db = db_session

    def get_by_email(self, email : str):
        return self.db.exec(select(Candidate).where(Candidate.email == email)).first()

    def get_by_id(self, candidate_id : uuid.UUID):
        return self.db.get(Candidate, candidate_id)

    def list(self, offset : int, limit : int):
        items = self.db.exec(select(Candidate).offset(offset).limit(limit)).all()
        total = self.db.exec(select(func.count()).select_from(Candidate)).one()
        return items, total

    def save(self, candidate : Candidate) -> Candidate:

        self.db.add(candidate)
        self.db.commit()
        self.db.refresh(candidate)

        return candidate

    def delete(self, candidate : Candidate):
        self.db.delete(candidate)
        self.db.commit()
