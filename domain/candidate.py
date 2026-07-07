from sqlmodel import SQLModel, Field, Relationship
import uuid
from typing import List, Optional



class Candidate(SQLModel, table=True):

    __tablename__ = 'candidates'

    id : uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    name : str = Field(nullable=False)
    email : str = Field(nullable=False, unique=True, index=True)
    password_hash : Optional[str] = Field(default=None, nullable=True)

    professional_profile : Optional['CandidateProfile'] = Relationship(back_populates='candidate',
                                                            sa_relationship_kwargs={
                                            "cascade": "all, delete-orphan",
                                            "passive_deletes": True})
    applications : Optional[List["Application"]] = Relationship(back_populates="candidate")
