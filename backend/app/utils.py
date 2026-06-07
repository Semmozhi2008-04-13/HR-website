import bcrypt

def hash_password(plain_password: str) -> str:
    """Hash a plain password using bcrypt.
    Returns the hashed password as a UTF-8 string.
    """
    # bcrypt expects bytes
    hashed = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored bcrypt hash.
    Returns True if the password matches, False otherwise.
    """
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        # In case the hashed_password format is invalid
        return False
