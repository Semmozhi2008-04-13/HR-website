from pydantic import BaseModel
from typing import Optional

class InterviewCreate(BaseModel):
    candidateId: int
    jobId: int
    interviewType: str
    interviewDate: str  # ISO datetime string
    interviewRound: Optional[int] = 1
    interviewers: Optional[str] = None
    mode: Optional[str] = "online"
    meetingLink: Optional[str] = None

class OfferCreate(BaseModel):
    candidateId: int
    position: str
    salary: float
    joiningDate: str  # ISO date string
    # For simplicity, PDF generation placeholder will be a static URL

class EvaluationResponse(BaseModel):
    candidateId: int
    jobApplicationId: int
    aiScore: Optional[float] = None
    technicalScore: Optional[float] = None
    researchScore: Optional[float] = None
    finalScore: Optional[float] = None
    determination: Optional[str] = None
    remarks: Optional[str] = None
