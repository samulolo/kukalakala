from datetime import datetime

from sqlalchemy import func, or_
from sqlmodel import Session, select
from domain.job import Job, JobType
import uuid


class JobRepository:

    def __init__(self, db_session : Session):
        self.db = db_session

    def get_by_id(self, job_id : uuid.UUID):
        return self.db.get(Job, job_id)

    def list(
        self,
        offset : int,
        limit : int,
        company_id : uuid.UUID = None,
        is_active : bool = None,
        type : JobType = None,
        q : str = None,
    ):
        query = select(Job)
        count_query = select(func.count()).select_from(Job)

        if company_id is not None:
            query = query.where(Job.company_id == company_id)
            count_query = count_query.where(Job.company_id == company_id)

        if is_active is not None:
            query = query.where(Job.is_active == is_active)
            count_query = count_query.where(Job.is_active == is_active)

        if type is not None:
            query = query.where(Job.type == type)
            count_query = count_query.where(Job.type == type)

        if q:
            search = f"%{q}%"
            condition = or_(
                Job.title.ilike(search),
                Job.description.ilike(search)
            )
            query = query.where(condition)
            count_query = count_query.where(condition)

        query = query.order_by(Job.created_at.desc())

        items = self.db.exec(query.offset(offset).limit(limit)).all()
        total = self.db.exec(count_query).one()
        return items, total

    def list_public(self, offset : int, limit : int, current_date : datetime, type : JobType = None, q : str = None):
        query = select(Job).where(
            Job.is_active == True
        )
        count_query = select(func.count()).select_from(Job).where(
            Job.is_active == True
        )

        if type is not None:
            query = query.where(Job.type == type)
            count_query = count_query.where(Job.type == type)

        if q:
            search = f"%{q}%"
            condition = or_(
                Job.title.ilike(search),
                Job.description.ilike(search)
            )
            query = query.where(condition)
            count_query = count_query.where(condition)

        query = query.order_by(Job.created_at.desc())

        items = self.db.exec(query.offset(offset).limit(limit)).all()
        total = self.db.exec(count_query).one()
        return items, total

    def save(self, job : Job) -> Job:

        self.db.add(job)
        self.db.commit()
        self.db.refresh(job)

        return job

    def delete(self, job : Job):
        self.db.delete(job)
        self.db.commit()
