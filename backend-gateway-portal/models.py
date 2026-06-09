def get_user_by_email(cursor, email):
    cursor.execute("SELECT id, email, password_hash, role FROM users WHERE email = %s", (email,))
    return cursor.fetchone()