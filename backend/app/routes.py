from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

from .database import get_db
from .models import User, Job, Applicant, Interview
from .schemas import UserSchema, JobSchema, ApplicantSchema, InterviewSchema
from .auth import auth_bp

api_bp = Blueprint('api', __name__)

# Register auth blueprint under the same API namespace
api_bp.register_blueprint(auth_bp)

# ---------- Utility Functions ----------
def paginate_query(query, page: int = 1, size: int = 10):
    if page < 1:
        page = 1
    if size < 1:
        size = 10
    total = query.count()
    items = query.offset((page - 1) * size).limit(size).all()
    return items, total

# ---------- User Endpoints (Read‑only for demo) ----------
@api_bp.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    db = next(get_db())
    users = db.query(User).all()
    schema = UserSchema(many=True)
    return jsonify(schema.dump(users))

# ---------- Job Endpoints ----------
@api_bp.route('/jobs', methods=['GET'])
@jwt_required()
def list_jobs():
    page = int(request.args.get('page', 1))
    size = int(request.args.get('size', 10))
    db = next(get_db())
    jobs_query = db.query(Job)
    jobs, total = paginate_query(jobs_query, page, size)
    schema = JobSchema(many=True)
    return jsonify({
        'total': total,
        'page': page,
        'size': size,
        'data': schema.dump(jobs)
    })

@api_bp.route('/jobs/<int:job_id>', methods=['GET'])
@jwt_required()
def get_job(job_id):
    db = next(get_db())
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return jsonify({'msg': 'Job not found'}), 404
    schema = JobSchema()
    return jsonify(schema.dump(job))

@api_bp.route('/jobs', methods=['POST'])
@jwt_required()
def create_job():
    data = request.get_json()
    schema = JobSchema()
    try:
        job_data = schema.load(data)
    except Exception as e:
        return jsonify({'msg': str(e)}), 400
    db = next(get_db())
    new_job = Job(**job_data)
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return jsonify(schema.dump(new_job)), 201

@api_bp.route('/jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    data = request.get_json()
    db = next(get_db())
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return jsonify({'msg': 'Job not found'}), 404
    schema = JobSchema(partial=True)
    try:
        job_updates = schema.load(data)
    except Exception as e:
        return jsonify({'msg': str(e)}), 400
    for key, value in job_updates.items():
        setattr(job, key, value)
    db.commit()
    return jsonify(schema.dump(job))

@api_bp.route('/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    db = next(get_db())
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return jsonify({'msg': 'Job not found'}), 404
    db.delete(job)
    db.commit()
    return jsonify({'msg': 'Job deleted'}), 200

@api_bp.route('/jobs/<int:job_id>/publish', methods=['POST'])
@jwt_required()
def publish_job(job_id):
    db = next(get_db())
    job = db.query(Job).filter(Job.id == job_id).first()
    if not job:
        return jsonify({'msg': 'Job not found'}), 404
    job.status = 'published'
    db.commit()
    schema = JobSchema()
    return jsonify(schema.dump(job))

# ---------- Applicant Endpoints ----------
@api_bp.route('/applicants', methods=['GET'])
@jwt_required()
def list_applicants():
    page = int(request.args.get('page', 1))
    size = int(request.args.get('size', 10))
    db = next(get_db())
    query = db.query(Applicant)
    items, total = paginate_query(query, page, size)
    schema = ApplicantSchema(many=True)
    return jsonify({'total': total, 'page': page, 'size': size, 'data': schema.dump(items)})

@api_bp.route('/applicants/<int:app_id>', methods=['GET'])
@jwt_required()
def get_applicant(app_id):
    db = next(get_db())
    applicant = db.query(Applicant).filter(Applicant.id == app_id).first()
    if not applicant:
        return jsonify({'msg': 'Applicant not found'}), 404
    return jsonify(ApplicantSchema().dump(applicant))

@api_bp.route('/applicants', methods=['POST'])
@jwt_required()
def create_applicant():
    data = request.get_json()
    schema = ApplicantSchema()
    try:
        app_data = schema.load(data)
    except Exception as e:
        return jsonify({'msg': str(e)}), 400
    db = next(get_db())
    new_app = Applicant(**app_data)
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return jsonify(schema.dump(new_app)), 201

@api_bp.route('/applicants/<int:app_id>', methods=['PUT'])
@jwt_required()
def update_applicant(app_id):
    data = request.get_json()
    db = next(get_db())
    applicant = db.query(Applicant).filter(Applicant.id == app_id).first()
    if not applicant:
        return jsonify({'msg': 'Applicant not found'}), 404
    schema = ApplicantSchema(partial=True)
    try:
        updates = schema.load(data)
    except Exception as e:
        return jsonify({'msg': str(e)}), 400
    for k, v in updates.items():
        setattr(applicant, k, v)
    db.commit()
    return jsonify(schema.dump(applicant))

@api_bp.route('/applicants/<int:app_id>', methods=['DELETE'])
@jwt_required()
def delete_applicant(app_id):
    db = next(get_db())
    applicant = db.query(Applicant).filter(Applicant.id == app_id).first()
    if not applicant:
        return jsonify({'msg': 'Applicant not found'}), 404
    db.delete(applicant)
    db.commit()
    return jsonify({'msg': 'Applicant deleted'}), 200

# ---------- Interview Endpoints ----------
@api_bp.route('/interviews', methods=['GET'])
@jwt_required()
def list_interviews():
    page = int(request.args.get('page', 1))
    size = int(request.args.get('size', 10))
    db = next(get_db())
    query = db.query(Interview)
    items, total = paginate_query(query, page, size)
    schema = InterviewSchema(many=True)
    return jsonify({'total': total, 'page': page, 'size': size, 'data': schema.dump(items)})

@api_bp.route('/interviews/<int:int_id>', methods=['GET'])
@jwt_required()
def get_interview(int_id):
    db = next(get_db())
    interview = db.query(Interview).filter(Interview.id == int_id).first()
    if not interview:
        return jsonify({'msg': 'Interview not found'}), 404
    return jsonify(InterviewSchema().dump(interview))

@api_bp.route('/interviews', methods=['POST'])
@jwt_required()
def create_interview():
    data = request.get_json()
    schema = InterviewSchema()
    try:
        iv_data = schema.load(data)
    except Exception as e:
        return jsonify({'msg': str(e)}), 400
    db = next(get_db())
    new_iv = Interview(**iv_data)
    db.add(new_iv)
    db.commit()
    db.refresh(new_iv)
    return jsonify(schema.dump(new_iv)), 201

@api_bp.route('/interviews/<int:int_id>', methods=['PUT'])
@jwt_required()
def update_interview(int_id):
    data = request.get_json()
    db = next(get_db())
    interview = db.query(Interview).filter(Interview.id == int_id).first()
    if not interview:
        return jsonify({'msg': 'Interview not found'}), 404
    schema = InterviewSchema(partial=True)
    try:
        updates = schema.load(data)
    except Exception as e:
        return jsonify({'msg': str(e)}), 400
    for k, v in updates.items():
        setattr(interview, k, v)
    db.commit()
    return jsonify(schema.dump(interview))

@api_bp.route('/interviews/<int:int_id>', methods=['DELETE'])
@jwt_required()
def delete_interview(int_id):
    db = next(get_db())
    interview = db.query(Interview).filter(Interview.id == int_id).first()
    if not interview:
        return jsonify({'msg': 'Interview not found'}), 404
    db.delete(interview)
    db.commit()
    return jsonify({'msg': 'Interview deleted'}), 200
