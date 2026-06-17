from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel

from backend.deps import get_db, get_current_user
from backend.models import User
from backend.utils.auth import get_password_hash, verify_password, create_access_token

router = APIRouter()


class UserCreate(BaseModel):
    username: str
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    username: str


class UserMeResponse(BaseModel):
    username: str
    email: Optional[str] = None
    created_at: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    email: Optional[str] = None


class UpdateProfileResponse(BaseModel):
    username: str
    email: Optional[str] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ChangePasswordResponse(BaseModel):
    message: str


@router.post("/register", response_model=TokenResponse, summary="Registrasi user baru")
def register_user(user: UserCreate, db: Session = Depends(get_db)) -> TokenResponse:
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    hashed_password = get_password_hash(user.password)
    new_user = User(username=user.username, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.username})
    return TokenResponse(access_token=access_token, token_type="bearer", username=new_user.username)


@router.post("/login", response_model=TokenResponse, summary="Login dan dapatkan JWT token")
def login(user: UserLogin, db: Session = Depends(get_db)) -> TokenResponse:
    db_user = db.query(User).filter(User.username == user.username).first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(data={"sub": db_user.username})
    return TokenResponse(access_token=access_token, token_type="bearer", username=db_user.username)


@router.get("/me", response_model=UserMeResponse, summary="Info user yang sedang login")
def read_users_me(current_user: User = Depends(get_current_user)) -> UserMeResponse:
    return UserMeResponse(
        username=current_user.username,
        email=current_user.email,
        created_at=current_user.created_at.isoformat() if current_user.created_at else None,
    )


@router.put("/profile", response_model=UpdateProfileResponse, summary="Update profil user")
def update_profile(
    body: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UpdateProfileResponse:
    email = body.email.strip() if body.email else None
    current_user.email = email or None
    db.commit()
    db.refresh(current_user)
    return UpdateProfileResponse(username=current_user.username, email=current_user.email)


@router.post("/change-password", response_model=ChangePasswordResponse, summary="Ubah kata sandi")
def change_password(
    body: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ChangePasswordResponse:
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Password saat ini salah")
    current_user.hashed_password = get_password_hash(body.new_password)
    db.commit()
    return ChangePasswordResponse(message="Password berhasil diubah")
