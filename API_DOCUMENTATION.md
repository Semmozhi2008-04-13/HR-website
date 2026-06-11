# API Endpoints for React Frontend

## Authentication
- POST `/api/auth/register/` - Register new user
- POST `/api/auth/login/` - Login get token
- GET `/api/auth/profile/` - Get user profile

## Dashboard Stats
- GET `/api/dashboard/stats/` - Get all dashboard statistics

## Job Management
- GET `/api/jobs/` - List all jobs
- POST `/api/jobs/` - Create new job
- GET `/api/jobs/{id}/` - Get job details
- PUT `/api/jobs/{id}/` - Update job
- DELETE `/api/jobs/{id}/` - Delete job

## Candidate Management
- GET `/api/candidates/` - List all candidates
- POST `/api/candidates/` - Add new candidate
- POST `/api/candidates/upload-resume/` - Upload resume with AI parsing
- GET `/api/candidates/{id}/` - Get candidate details
- PUT `/api/candidates/{id}/` - Update candidate
- DELETE `/api/candidates/{id}/` - Delete candidate

## AI Matching & Scoring
- POST `/api/ai-matching/rank-candidates/` - Rank candidates by AI score
- POST `/api/ai-matching/auto-shortlist/` - Auto-shortlist above threshold
- GET `/api/ai-matching/candidate-score/{id}/` - Get individual AI analysis

## Interview Management
- GET `/api/interviews/` - List all interviews
- POST `/api/interviews/schedule/` - Auto-schedule interviews
- POST `/api/interviews/{id}/send-reminder/` - Send email reminder
- PUT `/api/interviews/{id}/feedback/` - Submit panel feedback

## Evaluation & Scoring
- POST `/api/evaluation/panel-score/` - Submit panel evaluation
- GET `/api/evaluation/final-scores/` - Get combined AI+Panel scores
- POST `/api/evaluation/finalize/` - Finalize candidate evaluation

## Selection & Offers
- GET `/api/selection/shortlisted/` - Get shortlisted candidates
- POST `/api/selection/approve/{id}/` - Approve candidate for offer
- POST `/api/offers/generate/` - Generate offer letter
- POST `/api/offers/send-email/` - Send offer letter via email

## Notifications
- POST `/api/notifications/send-interview-email/` - Send interview notification
- POST `/api/notifications/send-selection-email/` - Send selection notification
- GET `/api/notifications/templates/` - Get email templates