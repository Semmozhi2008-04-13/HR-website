from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="hr")
    created_at = Column(DateTime, default=datetime.utcnow)

class Job(Base):
    __tablename__ = "jobs"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    department = Column(String)
    specialization = Column(String)
    salary = Column(String)
    qualifications = Column(Text)
    experience_years = Column(Integer)
    vacancies = Column(Integer, default=1)
    start_date = Column(DateTime)
    deadline = Column(DateTime)
    status = Column(String, default='draft')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Applicant(Base):
    __tablename__ = "applicants"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    resume_path = Column(String)
    applied_job_id = Column(Integer, ForeignKey('jobs.id'))
    applied_job = relationship('Job')
    status = Column(String, default='applied')
    created_at = Column(DateTime, default=datetime.utcnow)

class Interview(Base):
    __tablename__ = "interviews"
    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey('applicants.id'))
    candidate = relationship('Applicant')
    panelists = Column(Text)  # comma‑separated list of user IDs
    scheduled_at = Column(DateTime)
    room = Column(String)
    status = Column(String, default='scheduled')
    created_at = Column(DateTime, default=datetime.utcnow)
