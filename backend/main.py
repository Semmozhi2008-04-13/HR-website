from __future__ import annotations

import datetime
import re
from decimal import Decimal
from typing import Optional

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field, field_validator
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.ext.asyncio import AsyncSession

from backend.database import get_db
from backend.models import (
    Candidate,
    DashboardMetric,
    DashboardSchedule,
    DashboardTimeline,
    Department,
    EvaluationCandidate,
    Job,
    Interview,
    Offer,
    SelectionCandidate,
    parse_salary_to_decimal,
    seed_initial_data_if_empty,
    Base,
)

app = FastAPI(title="Smart Faculty Recruitment System API")

FRONTEND_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
    allow_headers=["*"],
)


class SelectionDecisionPayload(BaseModel):
    decision: Optional[str] = Field(default=None)

    model_config = ConfigDict(extra="forbid")

    @field_validator("decision")
    @classmethod
    def validate_decision(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        allowed = {"Selected", "Rejected"}
        if v not in allowed:
            raise ValueError("decision must be 'Selected' or 'Rejected' or null")
        return v


class ApplicationStatusPayload(BaseModel):
    status: str

    model_config = ConfigDict(extra="forbid")


class JobCreateInput(BaseModel):
    jobTitle: str = Field(min_length=1, max_length=200)
    department: str = Field(min_length=1, max_length=200)

    specialization: Optional[str] = Field(default="", max_length=500)
    qualifications: Optional[str] = Field(default="", max_length=10_000)

    salary: Optional[str] = Field(default="", max_length=10_000)
    minExperience: Optional[str] = Field(default="", max_length=200)
    vacancies: Optional[str] = Field(default="", max_length=50)

    startDate: Optional[str] = Field(default="", max_length=50)
    endDate: Optional[str] = Field(default="", max_length=50)

    status: str = Field(min_length=1, max_length=30)

    model_config = ConfigDict(extra="forbid")

    @field_validator("vacancies")
    @classmethod
    def validate_vacancies_gt_0(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        raw = (v or "").strip()
        if raw == "":
            return raw
        try:
            n = int(raw)
        except ValueError:
            raise ValueError("vacancies must be an integer string")
        if n <= 0:
            raise ValueError("vacancies must be > 0")
        return raw

    @field_validator("startDate", "endDate")
    @classmethod
    def validate_optional_date(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        raw = (v or "").strip()
        if raw == "":
            return ""
        # accept yyyy-mm-dd
        datetime.date.fromisoformat(raw)
        return raw


def _parse_date_to_utc_start(date_str: str) -> Optional[datetime.datetime]:
    if not date_str:
        return None
    d = datetime.date.fromisoformat(date_str)
    return datetime.datetime(d.year, d.month, d.day, tzinfo=datetime.timezone.utc)


@app.on_event("startup")
async def on_startup() -> None:
    # Create tables
    from backend.database import engine, AsyncSessionLocal

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed demo rows if empty
    await seed_initial_data_if_empty(AsyncSessionLocal)


@app.get("/api/dashboard")
async def get_dashboard_data(session: AsyncSession = Depends(get_db)):
    try:
        metrics = (await session.execute(select(DashboardMetric).order_by(DashboardMetric.id))).scalars().all()
        schedule = (await session.execute(select(DashboardSchedule).order_by(DashboardSchedule.id))).scalars().all()
        timeline = (await session.execute(select(DashboardTimeline).order_by(DashboardTimeline.id))).scalars().all()

        return {
            "metrics": [
                {"id": m.id, "title": m.title, "value": m.value, "icon": m.icon}
                for m in metrics
            ],
            "scheduleRows": [
                {
                    "id": r.id,
                    "name": r.name,
                    "role": r.role,
                    "skills": r.skills,
                    "initial": r.initial,
                    "avatarBg": r.avatar_bg,
                    "status": r.status,
                    "statusClass": r.status_class,
                    "action": r.action,
                }
                for r in schedule
            ],
            "timelineEvents": [
                {"id": e.id, "date": e.date, "description": e.description, "active": bool(e.active)}
                for e in timeline
            ],
        }
    except SQLAlchemyError as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")


@app.get("/api/jobs")
async def get_recruitment_jobs(session: AsyncSession = Depends(get_db)):
    try:
        jobs = (await session.execute(select(Job).order_by(Job.id.desc()))).scalars().all()
        return [
            {
                "id": j.id,
                "title": j.title,
                "designation": j.designation,
                "department": {"name": j.department.name},
                "_count": {"applications": j.applications_count},
            }
            for j in jobs
        ]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")


@app.post("/api/jobs", status_code=status.HTTP_201_CREATED)
async def create_new_recruitment_job(payload: JobCreateInput, session: AsyncSession = Depends(get_db)):
    try:
        vacancies_raw = (payload.vacancies or "").strip()
        vacancies_n = int(vacancies_raw) if vacancies_raw else 1
        if vacancies_n <= 0:
            raise HTTPException(status_code=422, detail="vacancies must be > 0")

        dept_name = payload.department.strip()

        start_at = _parse_date_to_utc_start((payload.startDate or "").strip())
        end_at = _parse_date_to_utc_start((payload.endDate or "").strip())

        salary_text = (payload.salary or "").strip()
        salary_amount: Optional[Decimal] = parse_salary_to_decimal(salary_text)
        if salary_text and salary_amount is None:
            raise HTTPException(status_code=422, detail="salary must contain at least one digit amount")

        min_exp_display = (payload.minExperience or "").strip()

        async with session.begin():
            dept = (await session.execute(select(Department).where(Department.name == dept_name))).scalars().first()
            if dept is None:
                code = re.sub(r"[^A-Za-z0-9]", "", dept_name).upper()[:10] or "GEN"
                dept = Department(name=dept_name, code=code)
                session.add(dept)
                await session.flush()

            job = Job(
                title=payload.jobTitle.strip(),
                designation=(min_exp_display if min_exp_display else "Professor"),
                department_id=dept.id,
                status=payload.status,
                vacancies=vacancies_n,
                applications_count=0,
                min_experience_years=None,
                specialization=(payload.specialization or "").strip(),
                qualifications=(payload.qualifications or "").strip(),
                salary_text=salary_text or None,
                salary_amount=salary_amount,
                application_start_at=start_at,
                application_end_at=end_at,
            )
            session.add(job)

        return {"success": True, "message": "Vacancy posted to core platform database successfully!"}

    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.get("/api/candidates")
async def get_candidates_list(session: AsyncSession = Depends(get_db)):
    try:
        candidates = (await session.execute(select(Candidate).order_by(Candidate.score.desc()))).scalars().all()
        return [
            {
                "id": c.id,
                "name": c.name,
                "initials": c.initials,
                "department": c.department,
                "score": c.score,
                "exp": c.exp,
                "expYears": c.exp_years,
                "qual": c.qual,
                "match": c.match,
                "research": c.research,
                "researchCount": c.research_count,
                "status": c.status,
                "color": c.color,
            }
            for c in candidates
        ]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")


@app.get("/api/interviews")
async def get_interviews_matrix(session: AsyncSession = Depends(get_db)):
    try:
        interviews = (await session.execute(select(Interview).order_by(Interview.id))).scalars().all()
        return [
            {
                "id": i.id,
                "name": i.name,
                "initials": i.initials,
                "avatarBg": i.avatar_bg,
                "panel": i.panel,
                "dateTime": i.scheduled_at.isoformat(sep=" ") if i.scheduled_at else "",
                "venue": i.venue,
                "status": i.status,
                "statusStyle": i.status_style,
            }
            for i in interviews
        ]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")


@app.get("/api/evaluation")
async def get_evaluation_screenings(session: AsyncSession = Depends(get_db)):
    try:
        rows_ = (await session.execute(select(EvaluationCandidate).order_by(EvaluationCandidate.final_score.desc()))).scalars().all()
        return [
            {
                "id": r.id,
                "name": r.name,
                "initials": r.initials,
                "aiScore": r.ai_score_text,
                "panelScore": r.panel_score_text,
                "recommendation": r.recommendation,
                "finalScore": r.final_score,
                "status": r.status,
            }
            for r in rows_
        ]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")


@app.get("/api/selection")
async def get_selection_board_candidates(session: AsyncSession = Depends(get_db)):
    try:
        rows_ = (await session.execute(select(SelectionCandidate).order_by(SelectionCandidate.score.desc()))).scalars().all()
        return [
            {
                "id": r.id,
                "name": r.name,
                "initials": r.initials,
                "type": r.type,
                "subType": r.sub_type,
                "score": r.score,
                "decision": r.decision,
            }
            for r in rows_
        ]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")


@app.patch("/api/selection/{id}")
async def patch_selection_committee_decision(
    id: int,
    payload: SelectionDecisionPayload,
    session: AsyncSession = Depends(get_db),
):
    try:
        async with session.begin():
            row = (await session.execute(select(SelectionCandidate).where(SelectionCandidate.id == id))).scalars().first()
            if row is None:
                raise HTTPException(status_code=404, detail="Selection entity target missing")
            row.decision = payload.decision

        return {"ok": True}
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")


@app.get("/api/offers")
async def get_issued_offers(session: AsyncSession = Depends(get_db)):
    try:
        offers = (await session.execute(select(Offer).order_by(Offer.id.desc()))).scalars().all()
        return [
            {
                "id": o.id,
                "name": o.name,
                "department": o.department,
                "designation": o.designation,
                "salary": o.salary_text,
                "status": o.status,
                "statusClass": o.status_class,
            }
            for o in offers
        ]
    except SQLAlchemyError as e:
        raise HTTPException(status_code=503, detail=f"Database error: {str(e)}")

