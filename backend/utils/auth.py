import datetime
import os

import bcrypt
from jose import jwt, JWTError

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "")
if not SECRET_KEY:
    import warnings
    warnings.warn(
        "JWT_SECRET_KEY environment variable is not set! "
        "Using a fallback key for development only. "
        "NEVER deploy to production without setting JWT_SECRET_KEY.",
        stacklevel=2,
    )
    SECRET_KEY = "dev-only-fallback-key-do-not-use-in-production"

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            return None
        return username
    except JWTError:
        return None
