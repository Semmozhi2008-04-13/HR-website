# backend/main.py
from __future__ import annotations

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, delete
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta, date
import os
from fastapi import BackgroundTasks
from services.pdf_generator import create_pdf
from services.email_service import send_offer

from backend.database.connection import get_db, engine, Base, AsyncSessionLocal
from backend.models import (
    Job,
    Candidate,
    JobApplication,
    Interview,
    Evaluation,
    Selection,
    OfferOnboarding,
    Skill,
    CandidateSkill,
    ResearchPaper,
    InterviewPanel,
    Notification,
)
import schemas as schemas

class JobCreateRequest(BaseModel):
    jobTitle: str
    department: str
    specialization: Optional[str] = None
    qualifications: Optional[str] = None
    salary: Optional[str] = None
    minExperience: Optional[str] = None
    vacancies: int = 1
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    status: str = "DRAFT"


class CandidateCreateRequest(BaseModel):
    firstName: str
    lastName: str
    email: str
    phone: Optional[str] = None
    experience: Optional[float] = None
    qualification: Optional[str] = None
    specialization: Optional[str] = None


class EvaluationCreateRequest(BaseModel):
    candidateId: int
    jobApplicationId: int
    aiScore: Optional[float] = None
    technicalScore: Optional[float] = None
    researchScore: Optional[float] = None
    finalScore: Optional[float] = None


class SelectionDecisionRequest(BaseModel):
    decision: str  # "Selected" or "Rejected"


app = FastAPI(title="Smart Faculty Recruitment System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        "http://localhost:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        from sqlalchemy import text

        await conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        await conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        await seed_data_if_empty(session)


async def seed_data_if_empty(session: AsyncSession):
    result = await session.execute(select(Candidate))
    if result.scalars().first() is not None:
        return

    skills = [
        Skill(skill_name="Python", category="Programming"),
        Skill(skill_name="React", category="Frontend"),
        Skill(skill_name="Machine Learning", category="AI"),
        Skill(skill_name="Deep Learning", category="AI"),
        Skill(skill_name="SQL", category="Database"),
        Skill(skill_name="Academic Research", category="Academic"),
    ]
    session.add_all(skills)
    await session.flush()

    job_cse = Job(
        job_code="JOB-CSE-001",
        position_name="Assistant Professor",
        department="School of Computer Science & Engineering",
        vacancies=10,
        applications_received=55,
        description="Ph.D. in Computer Science with focus on Artificial Intelligence and Machine Learning.",
        qualifications_required="Ph.D. in CSE or related field",
        experience_required=2,
        min_salary=1200000.00,
        max_salary=1800000.00,
        posted_date=datetime.now().date(),
        status="PUBLISHED",
    )
    job_ece = Job(
        job_code="JOB-ECE-002",
        position_name="Assistant Professor",
        department="School of Electronics & Communication Engineering",
        vacancies=5,
        applications_received=28,
        description="Ph.D. in Electronics with focus on VLSI, IoT and Embedded Systems.",
        qualifications_required="Ph.D. in ECE or related field",
        experience_required=3,
        min_salary=1100000.00,
        max_salary=1600000.00,
        posted_date=datetime.now().date(),
        status="PUBLISHED",
    )
    session.add_all([job_cse, job_ece])
    await session.flush()

    c1 = Candidate(
        candidate_code="CAN-RS-001",
        first_name="Reena",
        last_name="Sen",
        email="reena.sen@example.com",
        phone="9876543210",
        total_experience_years=8.0,
        highest_qualification="Ph.D. (IIT Kanpur)",
        specialization="CSE",
        ai_score=94.0,
        skills_match_percentage=95.0,
        research_score=92.0,
        application_status="shortlisted",
    )
    c2 = Candidate(
        candidate_code="CAN-LC-002",
        first_name="Liam",
        last_name="Chen",
        email="liam.chen@example.com",
        phone="9876543211",
        total_experience_years=6.0,
        highest_qualification="Ph.D. (NIT Trichy)",
        specialization="ECE",
        ai_score=92.0,
        skills_match_percentage=90.0,
        research_score=85.0,
        application_status="interviewed",
    )
    c3 = Candidate(
        candidate_code="CAN-PS-003",
        first_name="Priya",
        last_name="Subramanian",
        email="priya.subramanian@example.com",
        phone="9876543212",
        total_experience_years=4.5,
        highest_qualification="Ph.D in AI & ML",
        specialization="CSE",
        ai_score=96.0,
        skills_match_percentage=97.0,
        research_score=94.0,
        application_status="selected",
    )
    c4 = Candidate(
        candidate_code="CAN-RK-004",
        first_name="Rajesh",
        last_name="Kumar",
        email="rajesh.kumar@example.com",
        phone="9876543213",
        total_experience_years=3.0,
        highest_qualification="Ph.D. (IISc Bangalore)",
        specialization="CSE",
        ai_score=88.0,
        skills_match_percentage=85.0,
        research_score=80.0,
        application_status="applied",
    )
    session.add_all([c1, c2, c3, c4])
    await session.flush()

    ja1 = JobApplication(
        job_id=job_cse.id,
        candidate_id=c1.id,
        ai_score=94.0,
        skills_match=95.0,
        research_score=92.0,
        application_status="shortlisted",
    )
    ja2 = JobApplication(
        job_id=job_ece.id,
        candidate_id=c2.id,
        ai_score=92.0,
        skills_match=90.0,
        research_score=85.0,
        application_status="interviewed",
    )
    ja3 = JobApplication(
        job_id=job_cse.id,
        candidate_id=c3.id,
        ai_score=96.0,
        skills_match=97.0,
        research_score=94.0,
        application_status="selected",
    )
    ja4 = JobApplication(
        job_id=job_cse.id,
        candidate_id=c4.id,
        ai_score=88.0,
        skills_match=85.0,
        research_score=80.0,
        application_status="pending",
    )
    session.add_all([ja1, ja2, ja3, ja4])
    await session.flush()

    int1 = Interview(
        job_application_id=ja2.id,
        candidate_id=c2.id,
        interview_type="Technical Panel ECE",
        interview_date=datetime.now() + timedelta(hours=2),
        interview_round=1,
        interviewers="Dr. A. Kumar, Dr. B. Sharma",
        mode="online",
        meeting_link="https://teams.microsoft.com/l/meetup-join/19%3ameeting_Nz...",
        status="Ongoing",
        overall_score=85.0,
    )
    int2 = Interview(
        job_application_id=ja1.id,
        candidate_id=c1.id,
        interview_type="Technical Panel CSE",
        interview_date=datetime.now() - timedelta(days=1),
        interview_round=1,
        interviewers="Dr. S. R. Bose, Prof. M. Singh",
        mode="online",
        meeting_link="https://teams.microsoft.com/l/meetup-join/19%3ameeting_Mm...",
        status="Completed",
        overall_score=91.0,
    )
    session.add_all([int1, int2])
    await session.flush()

    ev1 = Evaluation(
        job_application_id=ja1.id,
        candidate_id=c1.id,
        ai_initial_score=94.0,
        interview_score=91.0,
        technical_assessment=92.0,
        research_evaluation=90.0,
        teaching_demo_score=88.0,
        final_score=91.2,
        final_percentage=91.2,
        determination="Recommended",
        remarks="Strong subject knowledge, good coding skills.",
    )
    ev2 = Evaluation(
        job_application_id=ja3.id,
        candidate_id=c3.id,
        ai_initial_score=96.0,
        interview_score=95.0,
        technical_assessment=96.0,
        research_evaluation=94.0,
        teaching_demo_score=93.0,
        final_score=94.8,
        final_percentage=94.8,
        determination="Strong Recommended",
        remarks="Outstanding publication record and research profile.",
    )
    session.add_all([ev1, ev2])
    await session.flush()

    sel1 = Selection(
        candidate_id=c3.id,
        job_id=job_cse.id,
        offered_position="Assistant Professor",
        offered_salary=1440000.00,
        joining_date=(datetime.now() + timedelta(days=30)).date(),
        acceptance_status="pending",
        status="in_progress",
    )
    session.add_all([sel1])

    papers = [
        ResearchPaper(
            candidate_id=c1.id,
            paper_title="Deep Learning in Healthcare",
            journal_name="IEEE Trans",
            publication_year=2024,
            citations_count=10,
        ),
        ResearchPaper(
            candidate_id=c1.id,
            paper_title="AI for NLP",
            journal_name="Springer AI",
            publication_year=2023,
            citations_count=5,
        ),
        ResearchPaper(
            candidate_id=c2.id,
            paper_title="IoT architectures",
            journal_name="IEEE IoT Journal",
            publication_year=2024,
            citations_count=12,
        ),
        ResearchPaper(
            candidate_id=c3.id,
            paper_title="Generative Models",
            journal_name="Nature Machine Intelligence",
            publication_year=2025,
            citations_count=35,
        ),
    ]
    session.add_all(papers)

    await session.commit()


@app.get("/")
async def root():
    return {"message": "HR Recruitment System API", "status": "running", "port": 5001}


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "database": "recruitment_system"}


@app.get("/api/dashboard")
async def get_dashboard(session: AsyncSession = Depends(get_db)):
    total_candidates = await session.scalar(select(func.count()).select_from(Candidate))
    shortlisted = await session.scalar(
        select(func.count()).select_from(Candidate).where(Candidate.application_status == "shortlisted")
    )
    total_jobs = await session.scalar(select(func.count()).select_from(Job))
    avg_ai_score = await session.scalar(select(func.avg(Candidate.ai_score)))
    total_vacancies = await session.scalar(select(func.sum(Job.vacancies)))

    result = await session.execute(
        select(Interview)
        .options(selectinload(Interview.candidate))
        .where(Interview.status.in_(["scheduled", "Ongoing", "Scheduled"]))
        .order_by(Interview.interview_date.asc())
    )
    interviews = result.scalars().all()

    schedule_rows = []
    for idx, i in enumerate(interviews):
        if not i.candidate:
            continue
        c = i.candidate
        initials = f"{c.first_name[0] if c.first_name else ''}{c.last_name[0] if c.last_name else ''}".upper()
        status_class = "bg-blue-100 text-blue-700"
        if i.status == "Ongoing":
            status_class = "bg-amber-100 text-amber-700"
        schedule_rows.append(
            {
                "id": i.id,
                "avatarBg": "bg-indigo-100 text-indigo-700" if idx % 2 == 0 else "bg-purple-100 text-purple-700",
                "initial": initials,
                "name": f"{c.first_name} {c.last_name}",
                "role": c.specialization or "Faculty",
                "statusClass": status_class,
                "status": i.status,
                "action": "Interview",
            }
        )

    return {
        "metrics": [
            {"id": 1, "icon": "group", "title": "Total Candidates", "value": str(total_candidates or 0)},
            {"id": 2, "icon": "auto_awesome", "title": "Avg AI Score", "value": f"{round(float(avg_ai_score or 0), 1)}%"},
            {"id": 3, "icon": "description", "title": "Open Job Vacancies", "value": str(total_vacancies or 0)},
            {"id": 4, "icon": "person_add", "title": "Shortlisted Candidates", "value": str(shortlisted or 0)},
        ],
        "scheduleRows": schedule_rows,
        "timelineEvents": [
            {"id": 1, "date": "10:00 AM", "description": "Technical Panel CSE Scheduled", "active": True},
            {"id": 2, "date": "02:00 PM", "description": "Dean Selection Review", "active": False},
        ],
    }


@app.get("/api/dashboard/stats")
async def get_dashboard_stats(session: AsyncSession = Depends(get_db)):
    total_candidates = await session.scalar(select(func.count()).select_from(Candidate))
    shortlisted = await session.scalar(
        select(func.count()).select_from(Candidate).where(Candidate.application_status == "shortlisted")
    )
    total_jobs = await session.scalar(select(func.count()).select_from(Job))
    avg_ai_score = await session.scalar(select(func.avg(Candidate.ai_score)))

    return {
        "total_candidates": total_candidates or 0,
        "shortlisted_candidates": shortlisted or 0,
        "total_jobs": total_jobs or 0,
        "avg_ai_score": round(float(avg_ai_score or 0), 2),
    }


@app.post("/api/jobs")
async def create_job(payload: JobCreateRequest, session: AsyncSession = Depends(get_db)):
    if payload.vacancies is None or payload.vacancies <= 0:
        raise HTTPException(status_code=400, detail="vacancies must be > 0")

    position_name = payload.jobTitle.strip()
    department = payload.department.strip()
    if not position_name or not department:
        raise HTTPException(status_code=400, detail="jobTitle and department are required")

    job = Job(
        job_code=f"JOB-{(payload.department[:3]).upper()}-{datetime.now().strftime('%M%S')}",
        position_name=position_name,
        department=department,
        vacancies=payload.vacancies,
        applications_received=0,
        status=payload.status,
        description=payload.qualifications,
        qualifications_required=payload.qualifications,
        experience_required=None,
        min_salary=None,
        max_salary=None,
        posted_date=None,
        closing_date=None,
    )

    if payload.startDate:
        try:
            job.posted_date = datetime.fromisoformat(payload.startDate).date()
        except ValueError:
            raise HTTPException(status_code=400, detail="startDate must be in YYYY-MM-DD format")

    if payload.endDate:
        try:
            job.closing_date = datetime.fromisoformat(payload.endDate).date()
        except ValueError:
            raise HTTPException(status_code=400, detail="endDate must be in YYYY-MM-DD format")

    async with session.begin():
        session.add(job)

    return {"success": True, "job_id": job.id}


@app.put("/api/jobs/{job_id}")
async def update_job(job_id: int, payload: JobCreateRequest, session: AsyncSession = Depends(get_db)):
    async with session.begin():
        job = await session.get(Job, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        job.position_name = payload.jobTitle or job.position_name
        job.department = payload.department or job.department
        job.vacancies = payload.vacancies or job.vacancies
        job.status = payload.status or job.status
        if payload.startDate:
            job.posted_date = datetime.fromisoformat(payload.startDate).date()
        if payload.endDate:
            job.closing_date = datetime.fromisoformat(payload.endDate).date()
    return {"success": True, "job_id": job.id}


@app.delete("/api/jobs/{job_id}")
async def delete_job(job_id: int, session: AsyncSession = Depends(get_db)):
    async with session.begin():
        job = await session.get(Job, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        await session.delete(job)
    return {"success": True}


@app.post("/api/candidates")
async def create_candidate(payload: CandidateCreateRequest, session: AsyncSession = Depends(get_db)):
    if not payload.firstName or not payload.lastName or not payload.email:
        raise HTTPException(status_code=400, detail="First name, last name and email are required")

    candidate = Candidate(
        candidate_code=f"CAN-{payload.email.split('@')[0].upper()}",
        first_name=payload.firstName,
        last_name=payload.lastName,
        email=payload.email,
        phone=payload.phone,
        total_experience_years=payload.experience or 0,
        highest_qualification=payload.qualification,
        specialization=payload.specialization,
        application_status="applied",
    )

    async with session.begin():
        session.add(candidate)

    return {"success": True, "candidate_id": candidate.id}


@app.put("/api/candidates/{candidate_id}")
async def update_candidate(candidate_id: int, payload: CandidateCreateRequest, session: AsyncSession = Depends(get_db)):
    async with session.begin():
        cand = await session.get(Candidate, candidate_id)
        if not cand:
            raise HTTPException(status_code=404, detail="Candidate not found")
        cand.first_name = payload.firstName or cand.first_name
        cand.last_name = payload.lastName or cand.last_name
        cand.email = payload.email or cand.email
        cand.phone = payload.phone or cand.phone
        cand.total_experience_years = payload.experience or cand.total_experience_years
        cand.highest_qualification = payload.qualification or cand.highest_qualification
        cand.specialization = payload.specialization or cand.specialization

    return {"success": True, "candidate_id": cand.id}


@app.delete("/api/candidates/{candidate_id}")
async def delete_candidate(candidate_id: int, session: AsyncSession = Depends(get_db)):
    async with session.begin():
        cand = await session.get(Candidate, candidate_id)
        if not cand:
            raise HTTPException(status_code=404, detail="Candidate not found")
        await session.delete(cand)
    return {"success": True}


@app.get("/api/jobs")
async def get_jobs(session: AsyncSession = Depends(get_db)):
    result = await session.execute(select(Job).order_by(Job.id.desc()))
    jobs = result.scalars().all()
    return [
        {
            "id": j.id,
            "job_code": j.job_code,
            "position_name": j.position_name,
            "department": j.department,
            "vacancies": j.vacancies,
            "applications_received": j.applications_received,
            "status": j.status,
        }
        for j in jobs
    ]


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: int, session: AsyncSession = Depends(get_db)):
    job = await session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/api/candidates")
async def get_candidates(session: AsyncSession = Depends(get_db)):
    result = await session.execute(
        select(Candidate)
        .options(selectinload(Candidate.applications))
        .order_by(Candidate.ai_score.desc())
    )
    candidates = result.scalars().all()

    response_data = []
    for idx, c in enumerate(candidates):
        initials = f"{c.first_name[0] if c.first_name else ''}{c.last_name[0] if c.last_name else ''}".upper()
        papers_count = await session.scalar(select(func.count()).select_from(ResearchPaper).where(ResearchPaper.candidate_id == c.id))
        papers_count = papers_count or 0

        dept = c.specialization or "CSE"
        if c.applications:
            job_result = await session.get(Job, c.applications[0].job_id)
            if job_result:
                dept = job_result.department

        colors = [
            "bg-purple-100 text-purple-700",
            "bg-blue-100 text-blue-700",
            "bg-teal-100 text-teal-700",
            "bg-indigo-100 text-indigo-700",
        ]
        color = colors[idx % len(colors)]

        response_data.append(
            {
                "id": c.id,
                "candidate_code": c.candidate_code,
                "name": f"{c.first_name} {c.last_name}",
                "first_name": c.first_name,
                "last_name": c.last_name,
                "email": c.email,
                "initials": initials,
                "color": color,
                "score": int(c.ai_score or 0),
                "exp": f"{int(c.total_experience_years or 0)} Years",
                "expYears": c.total_experience_years or 0,
                "qual": c.highest_qualification or "Ph.D.",
                "match": int(c.skills_match_percentage or 0),
                "research": f"{papers_count} Papers",
                "researchCount": papers_count,
                "department": dept,
                "status": (c.application_status or "applied").upper(),
            }
        )

    return response_data


@app.get("/api/candidates/top")
async def get_top_candidates(limit: int = 10, session: AsyncSession = Depends(get_db)):
    result = await session.execute(
        select(Candidate)
        .where(Candidate.application_status == "shortlisted")
        .order_by(Candidate.ai_score.desc())
        .limit(limit)
    )
    candidates = result.scalars().all()

    return [
        {
            "Candidate Name": f"{c.first_name} {c.last_name}",
            "AI Score": f"{c.ai_score}%",
            "Experience": f"{c.total_experience_years} yrs" if c.total_experience_years else "0 yrs",
            "Qualification": c.highest_qualification,
            "Skills Match": f"{c.skills_match_percentage}%",
            "Research": f"{c.research_score}%",
            "Status": c.application_status,
        }
        for c in candidates
    ]


@app.get("/api/candidates/{candidate_id}")
async def get_candidate(candidate_id: int, session: AsyncSession = Depends(get_db)):
    result = await session.execute(
        select(Candidate)
        .options(selectinload(Candidate.applications))
        .where(Candidate.id == candidate_id)
    )
    c = result.scalar_one_or_none()
    if not c:
        raise HTTPException(status_code=404, detail="Candidate not found")

    dept = "School of Computer Science & Engineering"
    if c.applications:
        job_result = await session.get(Job, c.applications[0].job_id)
        if job_result:
            dept = job_result.department

    ref_num = f"CIT/HR/2026/{c.id:03d}"
    date_created = c.created_at.strftime("%d %b %Y") if c.created_at else "05 Jun 2026"

    return {
        "id": c.id,
        "name": f"{c.first_name} {c.last_name}",
        "first_name": c.first_name,
        "last_name": c.last_name,
        "email": c.email,
        "phone": c.phone,
        "qualification": c.highest_qualification or "Ph.D.",
        "department": dept,
        "basePay": "₹57,700",
        "refNumber": ref_num,
        "dateCreated": date_created,
        "status": c.application_status,
    }


@app.post("/api/interviews")
async def schedule_interview(payload: schemas.InterviewCreate, session: AsyncSession = Depends(get_db)):
    job_app = await session.get(JobApplication, payload.jobId)
    if not job_app:
        raise HTTPException(status_code=404, detail="Job application not found")

    candidate = await session.get(Candidate, payload.candidateId)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    interview = Interview(
        job_application_id=payload.jobId,
        candidate_id=payload.candidateId,
        interview_type=payload.interviewType,
        interview_date=datetime.fromisoformat(payload.interviewDate),
        interview_round=payload.interviewRound or 1,
        interviewers=payload.interviewers,
        mode=payload.mode or "online",
        meeting_link=payload.meetingLink,
        status="scheduled",
        overall_score=None,
    )

    async with session.begin():
        session.add(interview)
        await session.flush()

    return {
        "id": interview.id,
        "candidateId": interview.candidate_id,
        "jobId": interview.job_application_id,
        "interviewType": interview.interview_type,
        "interviewDate": interview.interview_date.isoformat(),
        "interviewRound": interview.interview_round,
        "interviewers": interview.interviewers,
        "mode": interview.mode,
        "meetingLink": interview.meeting_link,
        "status": interview.status,
    }


@app.delete("/api/interviews/{id}")
async def cancel_interview(id: int, session: AsyncSession = Depends(get_db)):
    async with session.begin():
        await session.execute(delete(Interview).where(Interview.id == id))
    return {"success": True}


@app.post("/api/evaluation")
async def create_evaluation(payload: EvaluationCreateRequest, session: AsyncSession = Depends(get_db)):
    candidate = await session.get(Candidate, payload.candidateId)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    job_app = await session.get(JobApplication, payload.jobApplicationId)
    if not job_app:
        raise HTTPException(status_code=404, detail="Job application not found")

    eval_result = await session.execute(select(Evaluation).where(Evaluation.candidate_id == candidate.id))
    ev = eval_result.scalar_one_or_none()
    if not ev:
        ev = Evaluation(candidate_id=candidate.id, job_application_id=job_app.id)
        session.add(ev)

    ev.ai_initial_score = payload.aiScore
    ev.interview_score = payload.aiScore  # placeholder
    ev.technical_assessment = payload.technicalScore
    ev.research_evaluation = payload.researchScore
    ev.final_score = payload.finalScore
    ev.determination = "Recommended"

    async with session.begin():
        await session.flush()

    return {"success": True, "evaluation_id": ev.id}


@app.delete("/api/evaluation/{id}")
async def remove_evaluation(id: int, session: AsyncSession = Depends(get_db)):
    async with session.begin():
        c = await session.get(Candidate, id)
        if c:
            c.application_status = "applied"
        await session.execute(delete(Evaluation).where(Evaluation.candidate_id == id))
    return {"success": True}


@app.get("/api/selection")
async def get_selection_list(session: AsyncSession = Depends(get_db)):
    result = await session.execute(
        select(Candidate)
        .options(selectinload(Candidate.interviews))
        .where(Candidate.application_status.in_(["selected", "offered", "rejected", "interviewed", "shortlisted"]))
        .order_by(Candidate.ai_score.desc())
    )
    candidates = result.scalars().all()

    response_data = []
    for c in candidates:
        initials = f"{c.first_name[0] if c.first_name else ''}{c.last_name[0] if c.last_name else ''}".upper()

        ev = (await session.execute(select(Evaluation).where(Evaluation.candidate_id == c.id))).scalar_one_or_none()

        recommendation_type = "Recommended"
        sub_type = c.highest_qualification or "Ph.D."
        final_score = c.ai_score

        if ev:
            recommendation_type = ev.determination or "Recommended"
            final_score = ev.final_score
            sub_type = f"{c.highest_qualification} - {ev.remarks}"[:30] if ev.remarks else c.highest_qualification

        sel = (await session.execute(select(Selection).where(Selection.candidate_id == c.id))).scalar_one_or_none()
        if sel:
            decision = "Selected" if sel.status == "in_progress" or sel.status == "accepted" else "Rejected"
        elif c.application_status in ("selected", "offered"):
            decision = "Selected"
        elif c.application_status == "rejected":
            decision = "Rejected"
        else:
            decision = None

        response_data.append(
            {
                "id": c.id,
                "name": f"{c.first_name} {c.last_name}",
                "initials": initials,
                "type": recommendation_type,
                "subType": sub_type,
                "score": final_score,
                "decision": decision,
            }
        )

    return response_data


@app.patch("/api/selection/{id}")
async def update_selection_decision(id: int, payload: SelectionDecisionRequest, session: AsyncSession = Depends(get_db)):
    async with session.begin():
        c = await session.get(Candidate, id)
        if not c:
            raise HTTPException(status_code=404, detail="Candidate not found")

        if payload.decision == "Selected":
            c.application_status = "selected"
            sel = (await session.execute(select(Selection).where(Selection.candidate_id == id))).scalar_one_or_none()
            if not sel:
                ja = (await session.execute(select(JobApplication).where(JobApplication.candidate_id == id))).scalars().first()
                job_id = ja.job_id if ja else None

                session.add(
                    Selection(
                        candidate_id=id,
                        job_id=job_id,
                        offered_position="Assistant Professor",
                        offered_salary=1440000.00,
                        status="in_progress",
                    )
                )
        else:
            c.application_status = "rejected"
            await session.execute(delete(Selection).where(Selection.candidate_id == id))

    return {"success": True}


@app.get("/api/interviews")
async def get_interviews(status: str = None, session: AsyncSession = Depends(get_db)):
    """Get list of interviews with optional status filter."""
    query = select(Interview).options(selectinload(Interview.candidate))
    if status:
        query = query.where(Interview.status == status)
    query = query.order_by(Interview.interview_date.desc())
    
    result = await session.execute(query)
    interviews = result.scalars().all()
    
    response_data = []
    for i in interviews:
        if i.candidate:
            response_data.append({
                "id": i.id,
                "candidate_id": i.candidate_id,
                "candidate_name": f"{i.candidate.first_name} {i.candidate.last_name}",
                "interview_type": i.interview_type,
                "interview_date": i.interview_date.isoformat() if i.interview_date else None,
                "interview_round": i.interview_round,
                "interviewers": i.interviewers,
                "mode": i.mode,
                "meeting_link": i.meeting_link,
                "status": i.status,
                "overall_score": i.overall_score,
                "remarks": i.remarks,
            })
    
    return response_data


@app.get("/api/interviews/{interview_id}")
async def get_interview(interview_id: int, session: AsyncSession = Depends(get_db)):
    """Get interview details."""
    result = await session.execute(
        select(Interview)
        .options(selectinload(Interview.candidate), selectinload(Interview.interview_panels))
        .where(Interview.id == interview_id)
    )
    interview = result.scalar_one_or_none()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    
    return {
        "id": interview.id,
        "candidate_id": interview.candidate_id,
        "job_application_id": interview.job_application_id,
        "candidate_name": f"{interview.candidate.first_name} {interview.candidate.last_name}" if interview.candidate else "",
        "interview_type": interview.interview_type,
        "interview_date": interview.interview_date.isoformat() if interview.interview_date else None,
        "interview_round": interview.interview_round,
        "interviewers": interview.interviewers,
        "mode": interview.mode,
        "meeting_link": interview.meeting_link,
        "status": interview.status,
        "overall_score": interview.overall_score,
        "remarks": interview.remarks,
        "interview_panels": [
            {
                "id": ip.id,
                "panel_member_name": ip.panel_member_name,
                "designation": ip.designation,
                "score_given": ip.score_given,
                "comments": ip.comments,
            }
            for ip in interview.interview_panels
        ] if interview.interview_panels else [],
    }


@app.put("/api/interviews/{interview_id}")
async def update_interview(interview_id: int, payload: schemas.InterviewUpdate, session: AsyncSession = Depends(get_db)):
    """Update interview details."""
    async with session.begin():
        interview = await session.get(Interview, interview_id)
        if not interview:
            raise HTTPException(status_code=404, detail="Interview not found")
        
        if payload.interviewType:
            interview.interview_type = payload.interviewType
        if payload.interviewDate:
            interview.interview_date = datetime.fromisoformat(payload.interviewDate)
        if payload.interviewRound:
            interview.interview_round = payload.interviewRound
        if payload.interviewers:
            interview.interviewers = payload.interviewers
        if payload.mode:
            interview.mode = payload.mode
        if payload.meetingLink:
            interview.meeting_link = payload.meetingLink
        if payload.status:
            interview.status = payload.status
        if payload.overall_score is not None:
            interview.overall_score = payload.overall_score
    
    return {"success": True, "interview_id": interview_id}


@app.get("/api/evaluation")
async def get_evaluations(status: str = None, session: AsyncSession = Depends(get_db)):
    """Get list of evaluations with optional status filter."""
    query = select(Evaluation).options(selectinload(Evaluation.candidate))
    query = query.order_by(Evaluation.created_at.desc())
    
    result = await session.execute(query)
    evaluations = result.scalars().all()
    
    response_data = []
    for ev in evaluations:
        if ev.candidate:
            response_data.append({
                "id": ev.id,
                "candidate_id": ev.candidate_id,
                "candidate_name": f"{ev.candidate.first_name} {ev.candidate.last_name}",
                "job_application_id": ev.job_application_id,
                "ai_initial_score": ev.ai_initial_score,
                "interview_score": ev.interview_score,
                "technical_assessment": ev.technical_assessment,
                "research_evaluation": ev.research_evaluation,
                "teaching_demo_score": ev.teaching_demo_score,
                "final_score": ev.final_score,
                "final_percentage": ev.final_percentage,
                "determination": ev.determination,
                "remarks": ev.remarks,
            })
    
    return response_data


@app.get("/api/evaluation/{evaluation_id}")
async def get_evaluation(evaluation_id: int, session: AsyncSession = Depends(get_db)):
    """Get evaluation details."""
    evaluation = await session.get(Evaluation, evaluation_id)
    if not evaluation:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    return {
        "id": evaluation.id,
        "candidate_id": evaluation.candidate_id,
        "job_application_id": evaluation.job_application_id,
        "ai_initial_score": evaluation.ai_initial_score,
        "interview_score": evaluation.interview_score,
        "technical_assessment": evaluation.technical_assessment,
        "research_evaluation": evaluation.research_evaluation,
        "teaching_demo_score": evaluation.teaching_demo_score,
        "final_score": evaluation.final_score,
        "final_percentage": evaluation.final_percentage,
        "determination": evaluation.determination,
        "remarks": evaluation.remarks,
    }


@app.put("/api/evaluation/{evaluation_id}")
async def update_evaluation(evaluation_id: int, payload: schemas.EvaluationUpdate, session: AsyncSession = Depends(get_db)):
    """Update evaluation details."""
    async with session.begin():
        ev = await session.get(Evaluation, evaluation_id)
        if not ev:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        
        if payload.aiScore is not None:
            ev.ai_initial_score = payload.aiScore
        if payload.technicalScore is not None:
            ev.technical_assessment = payload.technicalScore
        if payload.researchScore is not None:
            ev.research_evaluation = payload.researchScore
        if payload.finalScore is not None:
            ev.final_score = payload.finalScore
        if payload.determination:
            ev.determination = payload.determination
        if payload.remarks:
            ev.remarks = payload.remarks
    
    return {"success": True, "evaluation_id": evaluation_id}


@app.get("/api/offers")
async def get_offers(session: AsyncSession = Depends(get_db)):
    """Get list of offers and onboarding status."""
    result = await session.execute(
        select(OfferOnboarding)
        .options(selectinload(OfferOnboarding.selection).selectinload(Selection.candidate))
        .order_by(OfferOnboarding.created_at.desc())
    )
    offers = result.scalars().all()
    
    response_data = []
    for offer in offers:
        if offer.selection and offer.selection.candidate:
            response_data.append({
                "id": offer.id,
                "selection_id": offer.selection_id,
                "candidate_id": offer.selection.candidate_id,
                "candidate_name": f"{offer.selection.candidate.first_name} {offer.selection.candidate.last_name}",
                "offered_position": offer.selection.offered_position,
                "offered_salary": float(offer.selection.offered_salary) if offer.selection.offered_salary else 0,
                "joining_date": offer.selection.joining_date.isoformat() if offer.selection.joining_date else None,
                "offer_letter_date": offer.offer_letter_date.isoformat() if offer.offer_letter_date else None,
                "offer_status": offer.offer_status,
                "onboarding_status": offer.onboarding_status,
                "remarks": offer.remarks,
            })
    
    return response_data


@app.get("/api/offers/{offer_id}")
async def get_offer(offer_id: int, session: AsyncSession = Depends(get_db)):
    """Get offer details."""
    offer = await session.get(OfferOnboarding, offer_id, options=[selectinload(OfferOnboarding.selection)])
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    
    return {
        "id": offer.id,
        "selection_id": offer.selection_id,
        "offer_letter_date": offer.offer_letter_date.isoformat() if offer.offer_letter_date else None,
        "offer_status": offer.offer_status,
        "onboarding_status": offer.onboarding_status,
        "joining_date": offer.selection.joining_date.isoformat() if offer.selection and offer.selection.joining_date else None,
        "remarks": offer.remarks,
    }


@app.put("/api/offers/{offer_id}")
async def update_offer(offer_id: int, payload: schemas.OfferUpdate, session: AsyncSession = Depends(get_db)):
    """Update offer details."""
    async with session.begin():
        offer = await session.get(OfferOnboarding, offer_id)
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
        
        if payload.offer_status:
            offer.offer_status = payload.offer_status
        if payload.onboarding_status:
            offer.onboarding_status = payload.onboarding_status  # Changed from onboarding_completed
        if payload.remarks:
            offer.remarks = payload.remarks
    
    return {"success": True, "offer_id": offer_id}


@app.post("/api/offers")
async def create_offer(payload: schemas.OfferCreate, session: AsyncSession = Depends(get_db)):
    """Create a new offer for a selected candidate."""
    # Get the candidate
    candidate = await session.get(Candidate, payload.candidateId)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    # Find or create selection
    sel_result = await session.execute(
        select(Selection).where(Selection.candidate_id == payload.candidateId).order_by(Selection.created_at.desc()).limit(1)
    )
    selection = sel_result.scalar_one_or_none()
    
    if not selection:
        raise HTTPException(status_code=400, detail="No selection found for candidate")
    
    # Create offer
    offer = OfferOnboarding(
        selection_id=selection.id,
        offer_letter_date=date.today(),
        offer_status="Pending",
        onboarding_status="Not Started",
        joining_date=datetime.fromisoformat(payload.joiningDate).date() if payload.joiningDate else date.today(),
    )
    
    async with session.begin():
        session.add(offer)
        await session.flush()
    
    return {"success": True, "offer_id": offer.id}


@app.delete("/api/offers/{offer_id}")
async def delete_offer(offer_id: int, session: AsyncSession = Depends(get_db)):
    """Delete an offer."""
    async with session.begin():
        offer = await session.get(OfferOnboarding, offer_id)
        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")
        await session.delete(offer)
    
    return {"success": True}


@app.get("/api/job-applications")
async def get_job_applications(job_id: int = None, candidate_id: int = None, session: AsyncSession = Depends(get_db)):
    """Get job applications with optional filters."""
    query = select(JobApplication).options(selectinload(JobApplication.candidate), selectinload(JobApplication.job))
    
    if job_id:
        query = query.where(JobApplication.job_id == job_id)
    if candidate_id:
        query = query.where(JobApplication.candidate_id == candidate_id)
    
    result = await session.execute(query.order_by(JobApplication.applied_date.desc()))
    applications = result.scalars().all()
    
    return [
        {
            "id": app.id,
            "job_id": app.job_id,
            "candidate_id": app.candidate_id,
            "candidate_name": f"{app.candidate.first_name} {app.candidate.last_name}" if app.candidate else "",
            "job_title": app.job.position_name if app.job else "",
            "application_status": app.application_status,
            "ai_score": app.ai_score,
            "skills_match": app.skills_match,
            "research_score": app.research_score,
            "applied_date": app.applied_date.isoformat() if app.applied_date else None,
        }
        for app in applications
    ]


@app.get("/api/job-applications/{application_id}")
async def get_job_application(application_id: int, session: AsyncSession = Depends(get_db)):
    """Get job application details."""
    app = await session.get(JobApplication, application_id, options=[selectinload(JobApplication.candidate), selectinload(JobApplication.job)])
    if not app:
        raise HTTPException(status_code=404, detail="Job application not found")
    
    return {
        "id": app.id,
        "job_id": app.job_id,
        "candidate_id": app.candidate_id,
        "candidate_name": f"{app.candidate.first_name} {app.candidate.last_name}" if app.candidate else "",
        "job_title": app.job.position_name if app.job else "",
        "application_status": app.application_status,
        "ai_score": app.ai_score,
        "skills_match": app.skills_match,
        "research_score": app.research_score,
        "applied_date": app.applied_date.isoformat() if app.applied_date else None,
    }


@app.get("/api/skills")
async def get_skills(session: AsyncSession = Depends(get_db)):
    """Get all skills."""
    result = await session.execute(select(Skill).order_by(Skill.skill_name))
    skills = result.scalars().all()
    
    return [
        {
            "id": skill.id,
            "skill_name": skill.skill_name,
            "category": skill.category,
        }
        for skill in skills
    ]


@app.post("/api/skills")
async def create_skill(payload: schemas.SkillCreate, session: AsyncSession = Depends(get_db)):
    """Create a new skill."""
    skill = Skill(skill_name=payload.skill_name, category=payload.category)
    
    async with session.begin():
        session.add(skill)
        await session.flush()
    
    return {"success": True, "skill_id": skill.id}


@app.get("/api/research-papers")
async def get_research_papers(candidate_id: int = None, session: AsyncSession = Depends(get_db)):
    """Get research papers with optional candidate filter."""
    query = select(ResearchPaper)
    if candidate_id:
        query = query.where(ResearchPaper.candidate_id == candidate_id)
    
    result = await session.execute(query.order_by(ResearchPaper.publication_year.desc()))
    papers = result.scalars().all()
    
    return [
        {
            "id": paper.id,
            "candidate_id": paper.candidate_id,
            "title": paper.title,
            "journal_name": paper.journal_name,
            "publication_year": paper.publication_year,
            "impact_factor": paper.impact_factor,
            "citations": paper.citations,
        }
        for paper in papers
    ]


@app.post("/api/research-papers")
async def create_research_paper(payload: schemas.ResearchPaperCreate, session: AsyncSession = Depends(get_db)):
    """Create a new research paper entry."""
    candidate = await session.get(Candidate, payload.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    
    paper = ResearchPaper(
        candidate_id=payload.candidate_id,
        title=payload.title,
        journal_name=payload.journal_name,
        publication_year=payload.publication_year,
        impact_factor=payload.impact_factor,
        citations=payload.citations,
    )
    
    async with session.begin():
        session.add(paper)
        await session.flush()
    
    return {"success": True, "paper_id": paper.id}


@app.delete("/api/research-papers/{paper_id}")
async def delete_research_paper(paper_id: int, session: AsyncSession = Depends(get_db)):
    """Delete a research paper."""
    async with session.begin():
        paper = await session.get(ResearchPaper, paper_id)
        if not paper:
            raise HTTPException(status_code=404, detail="Research paper not found")
        await session.delete(paper)
    
    return {"success": True}


@app.get("/api/notifications")
async def get_notifications(recipient_email: str = None, is_read: bool = None, session: AsyncSession = Depends(get_db)):
    """Get notifications with optional filters."""
    query = select(Notification)
    if recipient_email:
        query = query.where(Notification.recipient_email == recipient_email)
    if is_read is not None:
        query = query.where(Notification.is_read == is_read)
    
    result = await session.execute(query.order_by(Notification.created_at.desc()))
    notifications = result.scalars().all()
    
    return [
        {
            "id": notif.id,
            "recipient_email": notif.recipient_email,
            "subject": notif.subject,
            "message": notif.message,
            "notification_type": notif.notification_type,
            "is_read": notif.is_read,
            "created_at": notif.created_at.isoformat() if notif.created_at else None,
        }
        for notif in notifications
    ]


@app.post("/api/notifications")
async def create_notification(payload: schemas.NotificationCreate, session: AsyncSession = Depends(get_db)):
    """Create a new notification."""
    notification = Notification(
        recipient_email=payload.recipient_email,
        subject=payload.subject,
        message=payload.message,
        notification_type=payload.notification_type,
        related_entity_id=payload.related_entity_id,
        is_read=False,
    )
    
    async with session.begin():
        session.add(notification)
        await session.flush()
    
    return {"success": True, "notification_id": notification.id}


@app.patch("/api/notifications/{notification_id}")
async def mark_notification_read(notification_id: int, session: AsyncSession = Depends(get_db)):
    """Mark notification as read."""
    async with session.begin():
        notif = await session.get(Notification, notification_id)
        if not notif:
            raise HTTPException(status_code=404, detail="Notification not found")
        notif.is_read = True
        notif.read_at = datetime.utcnow()
    
    return {"success": True}

@app.post("/api/offers/send/{candidate_id}")
async def send_offer_letter(
    candidate_id:int,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db)
):

    candidate = await session.get(
        Candidate,
        candidate_id
    )


    if not candidate:
        raise HTTPException(
            status_code=404,
            detail="Candidate not found"
        )


    department = "School of Computer Science & Engineering"


    # load template

    with open(
        "templates/offer.html",
        "r"
    ) as file:

        html=file.read()



    # replace values

    html = html.replace(
        "{{name}}",
        f"{candidate.first_name} {candidate.last_name}"
    )


    html = html.replace(
        "{{role}}",
        "Assistant Professor"
    )


    html = html.replace(
        "{{department}}",
        department
    )


    pdf_file = create_pdf(html)


    # send email in background

    background_tasks.add_task(
        send_offer,
        candidate.email,
        pdf_file
    )


    # update status

    candidate.application_status="offer_sent"

    await session.commit()



    return {
        "message":"Offer generated and email sent",
        "candidate":candidate.email
    }