# backend/main.py
from __future__ import annotations

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, func, delete
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date, timedelta

from backend.backend.database import get_db, engine, Base, AsyncSessionLocal
from backend.backend.models import (
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
from backend import schemas

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

class InterviewCreateRequest(BaseModel):
    candidateId: int
    jobId: int
    interviewType: str
    interviewDate: str  # ISO format
    interviewRound: Optional[int] = 1
    interviewers: Optional[str] = None
    mode: Optional[str] = "online"
    meetingLink: Optional[str] = None

class EvaluationCreateRequest(BaseModel):
    candidateId: int
    jobApplicationId: int
    aiScore: Optional[float]
    technicalScore: Optional[float]
    researchScore: Optional[float]
    finalScore: Optional[float]

class OfferCreateRequest(BaseModel):
    candidateId: int
    position: str
    salary: float
    joiningDate: str
    # PDF placeholder – will just return a static URL
class SelectionDecisionRequest(BaseModel):
    decision: str  # "Selected" or "Rejected"

app = FastAPI(title="Smart Faculty Recruitment System API")

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================
# STARTUP - Create Tables & Seed Data
# ============================================
@app.on_event("startup")
async def on_startup():
    async with engine.begin() as conn:
        from sqlalchemy import text
        # Cascade drop the public schema to clean all old tables and constraint dependencies
        await conn.execute(text("DROP SCHEMA IF EXISTS public CASCADE;"))
        await conn.execute(text("CREATE SCHEMA public;"))
        await conn.execute(text("GRANT ALL ON SCHEMA public TO public;"))
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables recreated and verified!")

    async with AsyncSessionLocal() as session:
        await seed_data_if_empty(session)

async def seed_data_if_empty(session: AsyncSession):
    # Check if we already have candidates
    result = await session.execute(select(Candidate))
    if result.scalars().first() is not None:
        print("Database already has data. Skipping seed.")
        return

    print("Seeding initial data into database...")

    # 1. Create Skills
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

    # 2. Create Jobs
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
        status="PUBLISHED"
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
        status="PUBLISHED"
    )
    session.add_all([job_cse, job_ece])
    await session.flush()

    # 3. Create Candidates
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
        application_status="shortlisted"
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
        application_status="interviewed"
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
        application_status="selected"
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
        application_status="applied"
    )

    session.add_all([c1, c2, c3, c4])
    await session.flush()

    # 4. Job Applications
    ja1 = JobApplication(
        job_id=job_cse.id,
        candidate_id=c1.id,
        ai_score=94.0,
        skills_match=95.0,
        research_score=92.0,
        application_status="shortlisted"
    )
    ja2_id_ece = JobApplication(
        job_id=job_ece.id,
        candidate_id=c2.id,
        ai_score=92.0,
        skills_match=90.0,
        research_score=85.0,
        application_status="interviewed"
    )
    ja3 = JobApplication(
        job_id=job_cse.id,
        candidate_id=c3.id,
        ai_score=96.0,
        skills_match=97.0,
        research_score=94.0,
        application_status="selected"
    )
    ja4 = JobApplication(
        job_id=job_cse.id,
        candidate_id=c4.id,
        ai_score=88.0,
        skills_match=85.0,
        research_score=80.0,
        application_status="pending"
    )
    session.add_all([ja1, ja2_id_ece, ja3, ja4])
    await session.flush()

    # 5. Interviews
    int1 = Interview(
        job_application_id=ja2_id_ece.id,
        candidate_id=c2.id,
        interview_type="Technical Panel ECE",
        interview_date=datetime.now() + timedelta(hours=2),
        interview_round=1,
        interviewers="Dr. A. Kumar, Dr. B. Sharma",
        mode="online",
        meeting_link="https://teams.microsoft.com/l/meetup-join/19%3ameeting_Nz...",
        status="Ongoing",
        overall_score=85.0
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
        overall_score=91.0
    )
    session.add_all([int1, int2])
    await session.flush()

    # 6. Evaluations
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
        remarks="Strong subject knowledge, good coding skills."
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
        remarks="Outstanding publication record and research profile."
    )
    session.add_all([ev1, ev2])
    await session.flush()

    # 7. Selections
    sel1 = Selection(
        candidate_id=c3.id,
        job_id=job_cse.id,
        offered_position="Assistant Professor",
        offered_salary=1440000.00,
        joining_date=(datetime.now() + timedelta(days=30)).date(),
        acceptance_status="pending",
        status="in_progress"
    )
    session.add_all([sel1])

    # 8. Research Papers
    papers = [
        ResearchPaper(candidate_id=c1.id, paper_title="Deep Learning in Healthcare", journal_name="IEEE Trans", publication_year=2024, citations_count=10),
        ResearchPaper(candidate_id=c1.id, paper_title="AI for NLP", journal_name="Springer AI", publication_year=2023, citations_count=5),
        ResearchPaper(candidate_id=c2.id, paper_title="IoT architectures", journal_name="IEEE IoT Journal", publication_year=2024, citations_count=12),
        ResearchPaper(candidate_id=c3.id, paper_title="Generative Models", journal_name="Nature Machine Intelligence", publication_year=2025, citations_count=35),
    ]
    session.add_all(papers)

    await session.commit()
    print("Database seeding completed successfully!")


# ============================================
# HEALTH CHECK
# ============================================
@app.get("/")
async def root():
    return {"message": "HR Recruitment System API", "status": "running", "port": 5001}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "database": "recruitment_system"}


# ============================================
# DASHBOARD ENDPOINTS
# ============================================
@app.get("/api/dashboard")
async def get_dashboard(session: AsyncSession = Depends(get_db)):
    """Get dashboard stats, schedule, and timeline (used by Dashboard.jsx)"""
    total_candidates = await session.scalar(select(func.count()).select_from(Candidate))
    shortlisted = await session.scalar(
        select(func.count()).select_from(Candidate).where(Candidate.application_status == "shortlisted")
    )
    total_jobs = await session.scalar(select(func.count()).select_from(Job))
    avg_ai_score = await session.scalar(select(func.avg(Candidate.ai_score)))
    total_vacancies = await session.scalar(select(func.sum(Job.vacancies)))

    metrics = [
        {"id": 1, "icon": "group", "title": "Total Candidates", "value": str(total_candidates or 0)},
        {"id": 2, "icon": "auto_awesome", "title": "Avg AI Score", "value": f"{round(float(avg_ai_score or 0), 1)}%"},
        {"id": 3, "icon": "description", "title": "Open Job Vacancies", "value": str(total_vacancies or 0)},
        {"id": 4, "icon": "person_add", "title": "Shortlisted Candidates", "value": str(shortlisted or 0)},
    ]

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

        schedule_rows.append({
            "id": i.id,
            "avatarBg": "bg-indigo-100 text-indigo-700" if idx % 2 == 0 else "bg-purple-100 text-purple-700",
            "initial": initials,
            "name": f"{c.first_name} {c.last_name}",
            "role": c.specialization or "Faculty",
            "statusClass": status_class,
            "status": i.status,
            "action": "Interview"
        })

    timeline_events = [
        {
            "id": 1,
            "date": "10:00 AM",
            "description": "Technical Panel CSE Scheduled",
            "active": True
        },
        {
            "id": 2,
            "date": "02:00 PM",
            "description": "Dean Selection Review",
            "active": False
        }
    ]

    return {
        "metrics": metrics,
        "scheduleRows": schedule_rows,
        "timelineEvents": timeline_events
    }

@app.get("/api/dashboard/stats")
async def get_dashboard_stats(session: AsyncSession = Depends(get_db)):
    """Get dashboard stats summary"""
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


# ============================================
# JOBS ENDPOINTS
# ============================================
@app.post("/api/jobs")
async def create_job(payload: JobCreateRequest, session: AsyncSession = Depends(get_db)):
    """Create a job vacancy"""
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

# Update job
@app.put("/api/jobs/{job_id}")
async def update_job(job_id: int, payload: JobCreateRequest, session: AsyncSession = Depends(get_db)):
    async with session.begin():
        job = await session.get(Job, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        # Update mutable fields
        job.position_name = payload.jobTitle or job.position_name
        job.department = payload.department or job.department
        job.vacancies = payload.vacancies or job.vacancies
        job.status = payload.status or job.status
        if payload.startDate:
            job.posted_date = datetime.fromisoformat(payload.startDate).date()
        if payload.endDate:
            job.closing_date = datetime.fromisoformat(payload.endDate).date()
    return {"success": True, "job_id": job.id}

# Delete job
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
    """Create a new candidate"""
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

# Update candidate
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

# Delete candidate
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
    """Get all jobs"""
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
    """Get job by ID"""
    job = await session.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


# ============================================
# CANDIDATES ENDPOINTS
# ============================================
@app.get("/api/candidates")
async def get_candidates(session: AsyncSession = Depends(get_db)):
    """Get all candidates sorted by AI score (aligned with Candidates.jsx)"""
    result = await session.execute(
        select(Candidate)
        .options(selectinload(Candidate.applications))
        .order_by(Candidate.ai_score.desc())
    )
    candidates = result.scalars().all()

    response_data = []
    for idx, c in enumerate(candidates):
        initials = f"{c.first_name[0] if c.first_name else ''}{c.last_name[0] if c.last_name else ''}".upper()

        # Get research papers count
        papers_count = await session.scalar(
            select(func.count()).select_from(ResearchPaper).where(ResearchPaper.candidate_id == c.id)
        )
        papers_count = papers_count or 0

        # Find department from application
        dept = c.specialization or "CSE"
        if c.applications:
            job_result = await session.get(Job, c.applications[0].job_id)
            if job_result:
                dept = job_result.department

        colors = [
            "bg-purple-100 text-purple-700",
            "bg-blue-100 text-blue-700",
            "bg-teal-100 text-teal-700",
            "bg-indigo-100 text-indigo-700"
        ]
        color = colors[idx % len(colors)]

        response_data.append({
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
        })

    return response_data

@app.get("/api/candidates/top")
async def get_top_candidates(limit: int = 10, session: AsyncSession = Depends(get_db)):
    """Get top AI-scored candidates (matching PDF format)"""
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
    """Get candidate by ID (aligned with Offer.jsx dynamic fields)"""
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
        "status": c.application_status
    }


# ============================================
# INTERVIEWS ENDPOINTS
# ============================================
@app.post("/api/interviews")
async def schedule_interview(payload: schemas.InterviewCreate, session: AsyncSession = Depends(get_db)):
    """Schedule a new interview"""
    # Validate related entities
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
    # Return the created interview object (as dict)
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
    """Cancel an interview"""
    async with session.begin():
        await session.execute(delete(Interview).where(Interview.id == id))
    return {"success": True}


# ============================================
# EVALUATION ENDPOINTS
# ============================================
@app.post("/api/evaluation")
async def create_evaluation(payload: EvaluationCreateRequest, session: AsyncSession = Depends(get_db)):
    """Create or update evaluation for a candidate"""
    candidate = await session.get(Candidate, payload.candidateId)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    job_app = await session.get(JobApplication, payload.jobApplicationId)
    if not job_app:
        raise HTTPException(status_code=404, detail="Job application not found")
    # Upsert evaluation
    eval_result = await session.execute(
        select(Evaluation).where(Evaluation.candidate_id == candidate.id)
    )
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
    """Remove candidate from evaluation status"""
    async with session.begin():
        c = await session.get(Candidate, id)
        if c:
            c.application_status = "applied"
        await session.execute(delete(Evaluation).where(Evaluation.candidate_id == id))
    return {"success": True}


# ============================================
# SELECTION ENDPOINTS
# ============================================
@app.get("/api/selection")
async def get_selection_list(session: AsyncSession = Depends(get_db)):
    """Get candidates for final selection decision (aligned with Selection.jsx)"""
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

        eval_result = await session.execute(
            select(Evaluation).where(Evaluation.candidate_id == c.id)
        )
        ev = eval_result.scalar_one_or_none()

        recommendation_type = "Recommended"
        sub_type = c.highest_qualification or "Ph.D."
        final_score = c.ai_score

        if ev:
            recommendation_type = ev.determination or "Recommended"
            final_score = ev.final_score
            sub_type = f"{c.highest_qualification} - {ev.remarks}"[:30] if ev.remarks else c.highest_qualification

        sel_result = await session.execute(
            select(Selection).where(Selection.candidate_id == c.id)
        )
        sel = sel_result.scalar_one_or_none()
        decision = None
        if sel:
            decision = "Selected" if sel.status == "in_progress" or sel.status == "accepted" else "Rejected"
        elif c.application_status == "selected" or c.application_status == "offered":
            decision = "Selected"
        elif c.application_status == "rejected":
            decision = "Rejected"

        response_data.append({
            "id": c.id,
            "name": f"{c.first_name} {c.last_name}",
            "initials": initials,
            "type": recommendation_type,
            "subType": sub_type,
            "score": final_score,
            "decision": decision
        })

    return response_data

@app.patch("/api/selection/{id}")
async def update_selection_decision(id: int, payload: SelectionDecisionRequest, session: AsyncSession = Depends(get_db)):
    """Update selection decision (Selected / Reject)"""
    async with session.begin():
        c = await session.get(Candidate, id)
        if not c:
            raise HTTPException(status_code=404, detail="Candidate not found")

        if payload.decision == "Selected":
            c.application_status = "selected"

            sel_result = await session.execute(
                select(Selection).where(Selection.candidate_id == id)
            )
            sel = sel_result.scalar_one_or_none()
            if not sel:
                ja_result = await session.execute(
                    select(JobApplication).where(JobApplication.candidate_id == id)
                )
                ja = ja_result.scalars().first()
                job_id = ja.job_id if ja else None

                sel = Selection(
                    candidate_id=id,
                    job_id=job_id,
                    offered_position="Assistant Professor",
                    offered_salary=1440000.00,
                    status="in_progress"
                )
                session.add(sel)
        else:
            c.application_status = "rejected"
            await session.execute(delete(Selection).where(Selection.candidate_id == id))

    return {"success": True}


# ============================================
# OFFERS ENDPOINTS
# ============================================
@app.post("/api/offers")
async def create_offer(payload: schemas.OfferCreate, session: AsyncSession = Depends(get_db)):
    """Generate an offer for a candidate"""
    candidate = await session.get(Candidate, payload.candidateId)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    # Create OfferOnboarding (assuming model exists)
    offer = OfferOnboarding(
        candidate_id=candidate.id,
        position=payload.position,
        salary=payload.salary,
        joining_date=datetime.fromisoformat(payload.joiningDate).date(),
        # PDF placeholder URL could be static
        offer_doc_url="http://example.com/offer.pdf",
    )
    async with session.begin():
        session.add(offer)
    return {"success": True, "offer_id": offer.id}



