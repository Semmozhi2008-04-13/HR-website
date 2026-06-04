from __future__ import annotations

import datetime
import re
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    func,
)
from sqlalchemy.ext.asyncio import AsyncAttrs
from sqlalchemy.orm import Mapped, declarative_mixin, mapped_column, relationship

from .database import Base


def _now_utc() -> datetime.datetime:
    return datetime.datetime.now(datetime.timezone.utc)


# ---------------------------
# Helpers
# ---------------------------

def parse_salary_to_decimal(s: Optional[str]) -> Optional[Decimal]:
    """Parse salary text like '₹18,00,000 PA' into a Decimal amount (numeric).

    Backend accepts the frontend's plain-text salary input and converts it.
    """
    if s is None:
        return None

    # Keep digits only
    digits = re.sub(r"[^0-9]", "", s)
    if digits == "":
        return None

    # Use Decimal for NUMERIC compatibility
    return Decimal(digits)


# ---------------------------
# Dashboard
# ---------------------------
class DashboardMetric(Base):
    __tablename__ = "dashboard_metrics"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(80), nullable=False)
    value: Mapped[str] = mapped_column(String(80), nullable=False)
    icon: Mapped[str] = mapped_column(String(80), nullable=False)


class DashboardSchedule(Base):
    __tablename__ = "dashboard_schedule"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    role: Mapped[str] = mapped_column(String(120), nullable=False)
    skills: Mapped[str] = mapped_column(String(300), nullable=False)
    initial: Mapped[str] = mapped_column(String(10), nullable=False)
    avatar_bg: Mapped[str] = mapped_column(String(120), nullable=False)
    status: Mapped[str] = mapped_column(String(80), nullable=False)
    status_class: Mapped[str] = mapped_column(String(120), nullable=False)
    action: Mapped[str] = mapped_column(String(120), nullable=False)


class DashboardTimeline(Base):
    __tablename__ = "dashboard_timeline"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    date: Mapped[str] = mapped_column(String(80), nullable=False)
    description: Mapped[str] = mapped_column(String(200), nullable=False)
    active: Mapped[bool] = mapped_column(
        Integer,
        CheckConstraint("active IN (0, 1)", name="ck_dashboard_timeline_active_bool"),
        nullable=False,
        default=0,
    )


# ---------------------------
# Recruitment
# ---------------------------
class Department(Base):
    __tablename__ = "departments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(140), unique=True, nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(40), unique=True, nullable=False, index=True)


class Job(Base):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    designation: Mapped[str] = mapped_column(String(200), nullable=False)

    department_id: Mapped[int] = mapped_column(Integer, ForeignKey("departments.id", ondelete="RESTRICT"), nullable=False)
    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="Open",
    )

    vacancies: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    applications_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    min_experience_years: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

    specialization: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    qualifications: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    salary_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    salary_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(20, 2),
        nullable=True,
    )

    application_start_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    application_end_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now_utc)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now_utc, onupdate=_now_utc)

    department: Mapped[Department] = relationship("Department")

    applications: Mapped[list["Application"]] = relationship(
        "Application",
        back_populates="job",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint("vacancies > 0", name="ck_jobs_vacancies_gt_0"),
        CheckConstraint("applications_count >= 0", name="ck_jobs_applications_count_gte_0"),
        Index("ix_jobs_department_id", "department_id"),
    )


class Candidate(Base):
    __tablename__ = "candidates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    initials: Mapped[str] = mapped_column(String(10), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False, unique=True, index=True)

    # UI expects these fields
    department: Mapped[str] = mapped_column(String(120), nullable=False)
    score: Mapped[int] = mapped_column(Integer, nullable=False)
    exp: Mapped[str] = mapped_column(String(50), nullable=False)
    exp_years: Mapped[int] = mapped_column(Integer, nullable=False)
    qual: Mapped[str] = mapped_column(String(120), nullable=False)
    match: Mapped[int] = mapped_column(Integer, nullable=False)
    research: Mapped[str] = mapped_column(String(200), nullable=False)
    research_count: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False)
    color: Mapped[str] = mapped_column(String(120), nullable=False)

    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now_utc)

    applications: Mapped[list["Application"]] = relationship(
        "Application",
        back_populates="candidate",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint("score >= 0 AND score <= 100", name="ck_candidates_score_0_100"),
        CheckConstraint("match >= 0 AND match <= 100", name="ck_candidates_match_0_100"),
        CheckConstraint("exp_years >= 0", name="ck_candidates_exp_years_gte_0"),
        CheckConstraint("research_count >= 0", name="ck_candidates_research_count_gte_0"),
        Index("ix_candidates_score_desc", func.coalesce(score, 0).desc()),
    )


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    job_id: Mapped[int] = mapped_column(Integer, ForeignKey("jobs.id", ondelete="RESTRICT"), nullable=False)
    candidate_id: Mapped[int] = mapped_column(Integer, ForeignKey("candidates.id", ondelete="RESTRICT"), nullable=False)

    status: Mapped[str] = mapped_column(String(40), nullable=False, default="Applied")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now_utc)

    job: Mapped[Job] = relationship("Job", back_populates="applications")
    candidate: Mapped[Candidate] = relationship("Candidate", back_populates="applications")

    __table_args__ = (
        CheckConstraint("status IN ('Applied','SHORTLISTED','REVIEW','Selected','REJECTED','Rejected','Selected','Shortlisted')", name="ck_applications_status_enum"),
        ForeignKeyConstraint([candidate_id], ["candidates.id"]),
        Index("ix_applications_job_candidate", "job_id", "candidate_id", unique=True),
    )


class Interview(Base):
    __tablename__ = "interviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    initials: Mapped[str] = mapped_column(String(10), nullable=False)
    avatar_bg: Mapped[str] = mapped_column(String(120), nullable=False)

    panel: Mapped[str] = mapped_column(String(200), nullable=False)
    scheduled_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    venue: Mapped[str] = mapped_column(String(200), nullable=False)

    status: Mapped[str] = mapped_column(String(40), nullable=False)
    status_style: Mapped[str] = mapped_column(String(120), nullable=False)

    created_at: Mapped[datetime.datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=_now_utc)


class EvaluationCandidate(Base):
    __tablename__ = "evaluation_candidates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    initials: Mapped[str] = mapped_column(String(10), nullable=False)

    ai_score_text: Mapped[str] = mapped_column(String(40), nullable=False)
    panel_score_text: Mapped[str] = mapped_column(String(40), nullable=False)

    recommendation: Mapped[str] = mapped_column(String(200), nullable=False)
    final_score: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False)

    __table_args__ = (
        CheckConstraint("final_score >= 0", name="ck_eval_final_score_gte_0"),
    )


class SelectionCandidate(Base):
    __tablename__ = "selection_candidates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    initials: Mapped[str] = mapped_column(String(10), nullable=False)

    type: Mapped[str] = mapped_column(String(80), nullable=False)
    sub_type: Mapped[str] = mapped_column(String(80), nullable=False)

    score: Mapped[int] = mapped_column(Integer, nullable=False)
    decision: Mapped[Optional[str]] = mapped_column(String(40), nullable=True)

    __table_args__ = (
        CheckConstraint("score >= 0 AND score <= 100", name="ck_selection_score_0_100"),
        CheckConstraint("decision IS NULL OR decision IN ('Selected','Rejected')", name="ck_selection_decision"),
    )


class Offer(Base):
    __tablename__ = "offers"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    name: Mapped[str] = mapped_column(String(160), nullable=False)
    department: Mapped[str] = mapped_column(String(120), nullable=False)
    designation: Mapped[str] = mapped_column(String(140), nullable=False)

    salary_text: Mapped[str] = mapped_column(Text, nullable=False)
    salary_amount: Mapped[Optional[Decimal]] = mapped_column(Numeric(20, 2), nullable=True)

    status: Mapped[str] = mapped_column(String(40), nullable=False)
    status_class: Mapped[str] = mapped_column(String(120), nullable=False)


# ---------------------------
# Seed
# ---------------------------
async def seed_initial_data_if_empty(async_session_maker) -> None:
    """Seed demo/initial rows if tables are empty.

    This is invoked from backend startup.
    """
    async with async_session_maker() as session:
        # Dashboard metrics
        if (await session.scalar(func.count(DashboardMetric.id))) == 0:
            session.add_all(
                [
                    DashboardMetric(title="Total Faculty", value="245", icon="group"),
                    DashboardMetric(title="Vacancies", value="20", icon="business"),
                    DashboardMetric(title="Urgent Hiring", value="8", icon="person_add"),
                    DashboardMetric(title="Applications", value="62", icon="description"),
                    DashboardMetric(title="Interviews", value="12", icon="groups"),
                    DashboardMetric(title="Selections", value="5", icon="auto_awesome"),
                ]
            )

        # Dashboard schedule
        if (await session.scalar(func.count(DashboardSchedule.id))) == 0:
            session.add_all(
                [
                    DashboardSchedule(
                        name="Dr. Atkin Barne",
                        role="Professor",
                        skills="Machine Learning, NLP",
                        initial="AT",
                        avatar_bg="bg-orange-100 text-orange-600",
                        status="Completed",
                        status_class="bg-green-100 text-green-800",
                        action="View Results",
                    ),
                    DashboardSchedule(
                        name="Dr. Liam Chen",
                        role="Associate Professor",
                        skills="Cloud Computing, Security",
                        initial="LC",
                        avatar_bg="bg-blue-100 text-blue-600",
                        status="Shortlisted",
                        status_class="bg-purple-100 text-purple-800",
                        action="Evaluate",
                    ),
                    DashboardSchedule(
                        name="Dr. Reena Sen",
                        role="Assistant Professor",
                        skills="Data Structures, Java",
                        initial="RS",
                        avatar_bg="bg-purple-100 text-purple-600",
                        status="Pending",
                        status_class="bg-gray-100 text-gray-600",
                        action="Evaluate",
                    ),
                ]
            )

        # Timeline
        if (await session.scalar(func.count(DashboardTimeline.id))) == 0:
            session.add_all(
                [
                    DashboardTimeline(date="Today", description="4 Interviews Scheduled", active=1),
                    DashboardTimeline(date="Tuesday, May 19", description="Committee Briefing", active=0),
                    DashboardTimeline(date="Wednesday, May 20", description="Final Decision Meeting", active=0),
                    DashboardTimeline(date="Thursday, May 22", description="Review Details", active=0),
                ]
            )

        # Departments
        if (await session.scalar(func.count(Department.id))) == 0:
            session.add_all(
                [
                    Department(name="Computer Science", code="CSE"),
                    Department(name="Electronics", code="ECE"),
                    Department(name="Information Technology", code="IT"),
                ]
            )

        # Jobs
        if (await session.scalar(func.count(Job.id))) == 0:
            # Use parsed salaries only where available
            cs = await session.scalar(
                Department.__table__.select().where(Department.name == "Computer Science").limit(1)
            )
            # The above scalar is not portable; do a proper select
            from sqlalchemy import select

            cse_dept = (await session.execute(select(Department).where(Department.name == "Computer Science"))).scalar_one()
            ece_dept = (await session.execute(select(Department).where(Department.name == "Electronics"))).scalar_one()
            it_dept = (await session.execute(select(Department).where(Department.name == "Information Technology"))).scalar_one()

            session.add_all(
                [
                    Job(
                        title="CSE Faculty Recruitment",
                        designation="Professor",
                        department_id=cse_dept.id,
                        status="Active",
                        vacancies=24,
                        applications_count=0,
                        min_experience_years=None,
                        specialization="",
                        qualifications="",
                        salary_text=None,
                        salary_amount=None,
                        application_start_at=None,
                        application_end_at=None,
                    ),
                    Job(
                        title="ECE Research Openings",
                        designation="Associate Professor",
                        department_id=ece_dept.id,
                        status="Active",
                        vacancies=18,
                        applications_count=0,
                        min_experience_years=None,
                        specialization="",
                        qualifications="",
                        salary_text=None,
                        salary_amount=None,
                        application_start_at=None,
                        application_end_at=None,
                    ),
                    Job(
                        title="IT Department Vacancy",
                        designation="Assistant Professor",
                        department_id=it_dept.id,
                        status="Closed",
                        vacancies=20,
                        applications_count=0,
                        min_experience_years=None,
                        specialization="",
                        qualifications="",
                        salary_text=None,
                        salary_amount=None,
                        application_start_at=None,
                        application_end_at=None,
                    ),
                ]
            )

        # Candidates
        if (await session.scalar(func.count(Candidate.id))) == 0:
            session.add_all(
                [
                    Candidate(
                        name="Priya Sharma",
                        initials="PS",
                        email="priya.sharma@example.com",
                        department="CSE",
                        score=95,
                        exp="4 yrs",
                        exp_years=4,
                        qual="PhD",
                        match=90,
                        research="4 papers",
                        research_count=4,
                        status="SHORTLISTED",
                        color="bg-indigo-100 text-indigo-800",
                    ),
                    Candidate(
                        name="Mihona",
                        initials="M",
                        email="mihona.faculty@example.com",
                        department="IT",
                        score=91,
                        exp="3 yrs",
                        exp_years=3,
                        qual="M.Tech",
                        match=90,
                        research="2 papers",
                        research_count=2,
                        status="SHORTLISTED",
                        color="bg-amber-100 text-amber-800",
                    ),
                    Candidate(
                        name="Meena",
                        initials="ME",
                        email="meena.ece@example.com",
                        department="ECE",
                        score=87,
                        exp="1 yr",
                        exp_years=1,
                        qual="M.Tech",
                        match=80,
                        research="2 papers",
                        research_count=2,
                        status="SHORTLISTED",
                        color="bg-purple-100 text-purple-800",
                    ),
                    Candidate(
                        name="Kumar",
                        initials="K",
                        email="kumar.cse@example.com",
                        department="CSE",
                        score=82,
                        exp="1 yr",
                        exp_years=1,
                        qual="M.Tech",
                        match=80,
                        research="1 paper",
                        research_count=1,
                        status="SHORTLISTED",
                        color="bg-blue-100 text-blue-800",
                    ),
                    Candidate(
                        name="Sharma Reeya",
                        initials="SR",
                        email="reeya.s@example.com",
                        department="IT",
                        score=79,
                        exp="0 yrs",
                        exp_years=0,
                        qual="M.Tech",
                        match=75,
                        research="1 paper",
                        research_count=1,
                        status="PENDING",
                        color="bg-gray-100 text-gray-800",
                    ),
                    Candidate(
                        name="Arun Nair",
                        initials="AN",
                        email="arun.nair@example.com",
                        department="CSE",
                        score=76,
                        exp="2 yrs",
                        exp_years=2,
                        qual="M.Tech",
                        match=72,
                        research="3 papers",
                        research_count=3,
                        status="PENDING",
                        color="bg-cyan-100 text-cyan-800",
                    ),
                    Candidate(
                        name="Latha Menon",
                        initials="LM",
                        email="latha.m@example.com",
                        department="ECE",
                        score=74,
                        exp="5 yrs",
                        exp_years=5,
                        qual="PhD",
                        match=70,
                        research="5 papers",
                        research_count=5,
                        status="REVIEW",
                        color="bg-emerald-100 text-emerald-800",
                    ),
                ]
            )

        # Interviews
        if (await session.scalar(func.count(Interview.id))) == 0:
            session.add_all(
                [
                    Interview(
                        name="Dr. Reena Sen",
                        initials="RS",
                        avatar_bg="bg-[#1a237e] text-[#8690ee]",
                        panel="Dr. Smith",
                        scheduled_at=None,
                        venue="Meeting Room - 402",
                        status="Shortlisted",
                        status_style="bg-[#eddcff] text-[#5a2a9c]",
                    ),
                    Interview(
                        name="Dr. Liam Chen",
                        initials="LC",
                        avatar_bg="bg-[#705d00] text-white",
                        panel="Dr. Rao",
                        scheduled_at=None,
                        venue="Meeting Room - 302",
                        status="Ongoing",
                        status_style="bg-[#e0e0ff] text-[#343d96]",
                    ),
                    Interview(
                        name="Dr. Atkin Barne",
                        initials="AB",
                        avatar_bg="bg-gray-200 text-gray-700",
                        panel="Dr. Rama",
                        scheduled_at=None,
                        venue="Meeting Room - 104",
                        status="Completed",
                        status_style="bg-[#ffe170] text-[#221b00]",
                    ),
                ]
            )

        # Evaluation candidates
        if (await session.scalar(func.count(EvaluationCandidate.id))) == 0:
            session.add_all(
                [
                    EvaluationCandidate(
                        name="Dr. Reena Sen",
                        initials="RS",
                        ai_score_text="92 %",
                        panel_score_text="4.7 /5",
                        recommendation="Strong Recommended",
                        final_score=90,
                        status="Shortlisted",
                    ),
                    EvaluationCandidate(
                        name="Dr. Mihona",
                        initials="MH",
                        ai_score_text="88 %",
                        panel_score_text="4.3 /5",
                        recommendation="Strong Recommended",
                        final_score=90,
                        status="Shortlisted",
                    ),
                    EvaluationCandidate(
                        name="Dr. Meena",
                        initials="MN",
                        ai_score_text="83 %",
                        panel_score_text="4.1 /5",
                        recommendation="Strong Recommended",
                        final_score=87,
                        status="Shortlisted",
                    ),
                ]
            )

        # Selection candidates
        if (await session.scalar(func.count(SelectionCandidate.id))) == 0:
            session.add_all(
                [
                    SelectionCandidate(
                        name="Dr. Mihona",
                        initials="MS",
                        type="Strong",
                        sub_type="Recommended",
                        score=90,
                        decision="Selected",
                    ),
                    SelectionCandidate(
                        name="Dr. Meena",
                        initials="MA",
                        type="Strong",
                        sub_type="Recommended",
                        score=87,
                        decision=None,
                    ),
                    SelectionCandidate(
                        name="R. Kumar",
                        initials="RK",
                        type="Strong",
                        sub_type="Recommended",
                        score=85,
                        decision=None,
                    ),
                    SelectionCandidate(
                        name="Dr. Latha Menon",
                        initials="LM",
                        type="Strong",
                        sub_type="Recommended",
                        score=88,
                        decision="Selected",
                    ),
                ]
            )

        # Offers
        if (await session.scalar(func.count(Offer.id))) == 0:
            session.add_all(
                [
                    Offer(
                        name="Dr. Mihona",
                        department="IT",
                        designation="Professor",
                        salary_text="₹18,00,000 PA",
                        salary_amount=parse_salary_to_decimal("₹18,00,000 PA"),
                        status="Offered",
                        status_class="bg-blue-100 text-blue-800",
                    ),
                    Offer(
                        name="Dr. Latha Menon",
                        department="ECE",
                        designation="Strong Recommended",
                        salary_text="₹16,50,000 PA",
                        salary_amount=parse_salary_to_decimal("₹16,50,000 PA"),
                        status="Accepted",
                        status_class="bg-green-100 text-green-800",
                    ),
                ]
            )

        await session.commit()

