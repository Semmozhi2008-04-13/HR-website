from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from .utils import hash_password, verify_password
from .database import get_db
from .models import User
from sqlalchemy.exc import IntegrityError

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'hr')
    if not email or not password:
        return jsonify({'msg': 'Email and password required'}), 400
    hashed = hash_password(password)
    new_user = User(email=email, hashed_password=hashed, role=role)
    db = next(get_db())
    db.add(new_user)
    try:
        db.commit()
        db.refresh(new_user)
    except IntegrityError:
        db.rollback()
        return jsonify({'msg': 'User already exists'}), 409
    access_token = create_access_token(identity={'id': new_user.id, 'role': new_user.role})
    return jsonify({'access_token': access_token}), 201

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return jsonify({'msg': 'Email and password required'}), 400
    db = next(get_db())
    user = db.query(User).filter(User.email == email).first()
    if user is None or not verify_password(password, user.hashed_password):
        return jsonify({'msg': 'Invalid credentials'}), 401
    access_token = create_access_token(identity={'id': user.id, 'role': user.role})
    return jsonify({'access_token': access_token}), 200
