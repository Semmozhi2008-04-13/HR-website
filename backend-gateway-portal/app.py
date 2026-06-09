from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
from auth import verify_user

app = Flask(__name__)
CORS(app)
# CORS(app, origins=["http://localhost:5000"])

def get_db_connection():
    return psycopg2.connect(
        host="127.0.0.1",
        database="postgres",
        user="postgres",
        password="",
        port="5432"
    )

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    print(f"DEBUG: Attempting login for email: {data['email']}")

    conn = get_db_connection()
    cur = conn.cursor()
    
    cur.execute("SELECT email, password_hash FROM users WHERE email = %s", (data['email'],))
    row = cur.fetchone()
    print(f"DEBUG: Found in DB: {row}") 

    # Verify user
    user = verify_user(cur, data['email'], data['password'])
    
    cur.close()
    conn.close()

    if user:
        return jsonify({"success": True, "roles": user['role'].split(',')}), 200
    
    print("DEBUG: Authentication failed.")
    return jsonify({"success": False, "message": "Invalid credentials"}), 401

    # if user:
    #     roles_list = user['role'].split(',')
        
    #     # Return the list to the frontend
    #     return jsonify({"success": True, "roles": roles_list}), 200
        
    # return jsonify({"success": False, "message": "Invalid credentials"}), 401
    

if __name__ == '__main__':
    app.run(debug=True, port=5000)