from app import get_db_connection
from werkzeug.security import generate_password_hash

def add_user(email, password, role):
    conn = get_db_connection()
    cur = conn.cursor()
    
    # Hash the password
    password_hash = generate_password_hash(password)
    
    try:
        cur.execute(
            "INSERT INTO users (email, password_hash, role) VALUES (%s, %s, %s)",
            (email, password_hash, role)
        )
        conn.commit()
        print(f"User '{email}' with role '{role}' added successfully!")
    except Exception as e:
        print(f"Error adding {email}: {e}")
    finally:
        cur.close()
        conn.close()

# Now you can add as many as you want easily:
if __name__ == "__main__":
    add_user('hr@citchennai.edu', 'password123', 'HR')
    add_user('interviewer@citchennai.edu', 'interviewer123', 'INTERVIEWER')









