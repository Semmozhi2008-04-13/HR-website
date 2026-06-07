import os
from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .database import engine, Base
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    # Configuration
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'change_this_secret')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES', '3600'))  # seconds

    # Initialize extensions
    CORS(app)
    jwt = JWTManager(app)

    # Register API routes
    from .routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    # Create database tables if they don't exist
    Base.metadata.create_all(bind=engine)

    return app

# Instantiate the app for import elsewhere
app = create_app()
