import uuid

from sqlmodel import Session, select

from domain.application_message import ApplicationMessage


class ApplicationMessageRepository:

    def __init__(self, db_session : Session):
        self.db = db_session

    def list_by_application(self, application_id : uuid.UUID):
        return self.db.exec(
            select(ApplicationMessage)
            .where(ApplicationMessage.application_id == application_id)
            .order_by(ApplicationMessage.created_at.desc())
        ).all()

    def list_by_candidate(self, candidate_id : uuid.UUID, limit : int = 10):
        return self.db.exec(
            select(ApplicationMessage)
            .where(ApplicationMessage.candidate_id == candidate_id)
            .order_by(ApplicationMessage.created_at.desc())
            .limit(limit)
        ).all()

    def save(self, message : ApplicationMessage) -> ApplicationMessage:
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        return message
