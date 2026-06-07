from marshmallow import Schema, fields
from .models import User, Job, Applicant, Interview

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    email = fields.Email(required=True)
    role = fields.Str()
    created_at = fields.DateTime(dump_only=True)

class JobSchema(Schema):
    id = fields.Int(dump_only=True)
    title = fields.Str(required=True)
    department = fields.Str()
    specialization = fields.Str()
    salary = fields.Str()
    qualifications = fields.Str()
    experience_years = fields.Int()
    vacancies = fields.Int()
    start_date = fields.DateTime()
    deadline = fields.DateTime()
    status = fields.Str()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

class ApplicantSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    email = fields.Email(required=True)
    resume_path = fields.Str()
    applied_job_id = fields.Int()
    status = fields.Str()
    created_at = fields.DateTime(dump_only=True)

class InterviewSchema(Schema):
    id = fields.Int(dump_only=True)
    candidate_id = fields.Int(required=True)
    panelists = fields.Str()
    scheduled_at = fields.DateTime()
    room = fields.Str()
    status = fields.Str()
    created_at = fields.DateTime(dump_only=True)
