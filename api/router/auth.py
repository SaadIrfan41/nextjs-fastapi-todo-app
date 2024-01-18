from datetime import datetime, timedelta
from typing import Optional

from api.db.db_connection import get_db
from api.db.modals import Users
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session

SECRET_KEY = "KlgH6AzYDeZeGwD288to79I3vTHT8wp7"
ALGORITHM = "HS256"

router = APIRouter(prefix="/api/auth", tags=["auth"])


pwd_cxt = CryptContext(schemes=["bcrypt"], deprecated="auto")


class Hash:
    def bcrypt(self, password: str):
        return pwd_cxt.hash(password)

    def verify(self, hashed_password: str, plain_password: str):
        return pwd_cxt.verify(plain_password, hashed_password)


class CreateUser(BaseModel):
    username: str
    email: str
    password: str


hash = Hash()

oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/api/auth/token")


class TokenResponse(BaseModel):
    access_token: str


# User Exception
def get_user_exception():
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    return credentials_exception


# Token Exception
def token_exception():
    token_exception_response = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
    return token_exception_response


def authenticate_user(username: str, password: str, db: Session):
    user = db.query(Users).filter(Users.username == username).first()

    if not user:
        return False
    if not hash.verify(str(user.password), password):
        return False
    return user


async def get_current_user(token: str = Depends(oauth2_bearer)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("PAYLOAD......", payload)
        username: str | None = payload.get("sub")
        user_id: int | None = payload.get("id")
        if username is None or user_id is None:
            raise get_user_exception()
        return {"username": payload.get("sub"), "id": payload.get("id")}
    except JWTError:
        raise get_user_exception()


def create_access_token(
    username: str, user_id: int, expires_delta: Optional[timedelta] = None
):
    encode = {"sub": username, "id": user_id}

    # Check if expires_delta is provided
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        # If expires_delta is not provided, set a default expiration of 1 day
        expire = datetime.utcnow() + timedelta(days=1)

    encode.update({"exp": expire})

    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise token_exception()
    token_expires = timedelta(days=1)
    token = create_access_token(
        str(user.username), user.id, expires_delta=token_expires
    )
    return {"access_token": token}


# Create user
@router.post("/create_user")
def create_new_user(user: CreateUser, db: Session = Depends(get_db)) -> CreateUser:
    new_user = Users(
        username=user.username,
        email=user.email,
        password=hash.bcrypt(password=user.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user
