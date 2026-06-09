# auth.py
from werkzeug.security import check_password_hash

def verify_user(cursor, email, password):
    # Fetch user data using our model helper
    from models import get_user_by_email
    user_data = get_user_by_email(cursor, email)
    

    if user_data:
        # Debugging: Print these to your terminal
        print(f"DEBUG: Found Hash in DB: {user_data[2]}")
        print(f"DEBUG: Password Input: {password}")
        
        is_match = check_password_hash(user_data[2], password)
        print(f"DEBUG: Does it match? {is_match}")
        
        if is_match:
            return {"role": user_data[3]}
    return None


    # if user_data:
    #     # user_data[2] is password_hash, user_data[3] is role
    #     if check_password_hash(user_data[2], password):
    #         return {"role": user_data[3]}
    # return None