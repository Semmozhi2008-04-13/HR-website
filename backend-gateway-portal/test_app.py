from werkzeug.security import generate_password_hash
print(generate_password_hash("your_password_here"))





# run_setup.py
# from app import get_db_connection

# def setup_db():
#     conn = get_db_connection()
#     cur = conn.cursor()
#     cur.execute("""
#         CREATE TABLE IF NOT EXISTS users (
#             id SERIAL PRIMARY KEY,
#             email VARCHAR(255) UNIQUE NOT NULL,
#             password_hash VARCHAR(255) NOT NULL,
#             role VARCHAR(50) NOT NULL
#         );
#     """)
#     conn.commit()
#     cur.close()
#     conn.close()
#     print("Table created successfully!")

# setup_db()


# from flask import Flask
# app = Flask(__name__)

# @app.route('/')
# def home():
#     return "Backend is running!"

# if __name__ == '__main__':
#     app.run(debug=True)