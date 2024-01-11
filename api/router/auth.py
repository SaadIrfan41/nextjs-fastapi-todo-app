from datetime import datetime, timedelta
from typing import Optional

from db.db_connection import get_db
from db.modals import Users
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy.orm import Session

SECRET_KEY = "KlgH6AzYDeZeGwD288to79I3vTHT8wp7"
ALGORITHM = "HS256"
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="token")


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


router = APIRouter(prefix="/api/auth", tags=["auth"])

hash = Hash()


# Exceptions
def get_user_exception():
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    return credentials_exception


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
    if not hash.verify(password, str(user.password)):
        return False
    return user


async def get_current_user(token: str = Depends(oauth2_bearer)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        # username: str = payload.get("sub")
        # user_id: int = payload.get("id")
        if payload.get("sub") is None or payload.get("id") is None:
            raise get_user_exception()
        return {"username": payload.get("sub"), "id": payload.get("id")}
    except JWTError:
        raise get_user_exception()


def create_access_token(
    username: str, user_id: int, expires_delta: Optional[timedelta] = None
):
    encode = {"sub": username, "id": user_id}
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    encode.update({"exp": expire})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)


class TokenResponse(BaseModel):
    token: str


@router.post("/token", response_model=TokenResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise token_exception()
    token_expires = timedelta(minutes=20)
    token = create_access_token(
        str(user.username), user.id, expires_delta=token_expires
    )
    return {"token": token}


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
