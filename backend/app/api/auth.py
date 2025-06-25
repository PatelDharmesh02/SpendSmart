from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.schemas.auth import UserRegister, UserPublic, UserLogin, Token
from app.db.deps import get_db
from app.models.user import User
from app.core.security import hash_password, verify_password
from app.core.jwt import create_access_token
from app.api.deps import get_current_user

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=Token)
def register(user: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_pw = hash_password(user.password)

    # Create and save user
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_pw
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Generate token
    token = create_access_token(data={"sub": str(new_user.id)}, expires_delta=timedelta(minutes=60))
    if not token:
        raise HTTPException(status_code=500, detail="Could not create access token")
    return {"access_token": token}
    

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(data={"sub": str(db_user.id)}, expires_delta=timedelta(minutes=60)) #we can adjust the expiration time as needed kept as 60 minutes for now
    if not token:
        raise HTTPException(status_code=500, detail="Could not create access token")
    return {"access_token": token}


@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
