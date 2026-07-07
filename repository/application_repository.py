from sqlalchemy import func
from sqlmodel import Session, select
from domain.application import Application, ApplicationStatus
from domain.job import Job
import uuid


class ApplicationRepository:

    def __init__(self, db_session : Session):
        self.db = db_session

    def get_by_id(self, application_id : uuid.UUID):
        return self.db.get(Application, application_id)

    def list(
        self,
        offset : int,
        limit : int,
        candidate_id : uuid.UUID = None,
        job_id : uuid.UUID = None,
        status : ApplicationStatus = None,
    ):
        query = select(Application)
        count_query = select(func.count()).select_from(Application)

        if candidate_id is not None:
            query = query.where(Application.candidate_id == candidate_id)
            count_query = count_query.where(Application.candidate_id == candidate_id)

        if job_id is not None:
            query = query.where(Application.job_id == job_id)
            count_query = count_query.where(Application.job_id == job_id)

        if status is not None:
            query = query.where(Application.status == status)
            count_query = count_query.where(Application.status == status)

        query = query.order_by(Application.applied_at.desc())

        items = self.db.exec(query.offset(offset).limit(limit)).all()
        total = self.db.exec(count_query).one()
        return items, total

    def get_by_candidate_and_job(self, candidate_id : uuid.UUID, job_id : uuid.UUID):
        return self.db.exec(
            select(Application).where(
                Application.candidate_id == candidate_id,
                Application.job_id == job_id
            )
        ).first()

    def candidate_has_application_for_company(self, candidate_id : uuid.UUID, company_id : uuid.UUID):
        return self.db.exec(
            select(Application)
            .join(Job, Application.job_id == Job.id)
            .where(
                Application.candidate_id == candidate_id,
                Job.company_id == company_id
            )
        ).first() is not None

    def save(self, application : Application) -> Application:

        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)

        return application

    def delete(self, application : Application):
        self.db.delete(application)
        self.db.commit()
