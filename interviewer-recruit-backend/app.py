from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}}) 

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').lower()
    password = data.get('password', '')
    
    print(f"Received login request for: {email}") 
    
    # Simple hardcoded check for testing (Replace this later with a database query)
    if email == "hr@citchennai.edu" and password == "password123":
        return jsonify({
            "success": True, 
            "roles": ["HR"],
            "message": "Login successful"
        })
        
    elif email == "interviewer@citchennai.edu" and password == "interviewer123":
        return jsonify({
            "success": True, 
            "roles": ["INTERVIEWER"],
            "message": "Login successful"
        })
        
    else:
        return jsonify({
            "success": False, 
            "message": "Invalid email or password"
        }), 401

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)










# # In your Flask app.py
# from flask import Flask
# from flask_cors import CORS

# print("Starting Flask application...")

# app = Flask(__name__)

# # Update this to specifically include the Interviewer port
# CORS(app, resources={
#     r"/api/*": {
#         "origins": ["http://localhost:5174",
#                     "http://localhost:5173",
#                     "http://localhost:5172"]}})

# # can add more later

# if __name__ == '__main__':
#     print("Server is starting on port 5000...")
#     app.run(debug=True, port=5000)



# from flask import Flask, request, jsonify
# from flask_cors import CORS

# app = Flask(__name__)
# # CRITICAL: This allows your React frontend to communicate with Python
# CORS(app, resources={r"/api/*": {"origins": "*"}}) 

# @app.route('/api/login', methods=['POST'])
# def login():
#     data = request.json
#     print("Received login request:", data) # This will prove it works!
#     return jsonify({"success": True, "roles": ["HR"]})

# if __name__ == '__main__':
    # CRITICAL: host='0.0.0.0' forces Python to listen to BOTH 127.0.0.1 and localhost
    # app.run(host='0.0.0.0', port=5000, debug=True)
