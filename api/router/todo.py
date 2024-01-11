from typing import Any, Dict

from db.db_connection import get_db
from db.modals import Todos
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .auth import get_current_user, get_user_exception


class Todo(BaseModel):
    title: str
    complete: bool


router = APIRouter(
    prefix="/api/todos", tags=["todos"], responses={404: {"description": "Not found"}}
)


def http_exception():
    return HTTPException(status_code=404, detail="Todo not found")


@router.get("/")
async def read_all(db: Session = Depends(get_db)):
    return db.query(Todos).all()


@router.get("/user")
async def read_all_todos_by_user(
    user: Dict[str, Any | None] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.get("id") is None:
        raise get_user_exception()
    return db.query(Todos).filter(Todos.owner_id == user.get("id")).all()


@router.get("/{todo_id}")
async def read_single_todo(
    todo_id: int,
    user: Dict[str, Any | None] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.get("id") is None:
        raise get_user_exception()
    todo_model = (
        db.query(Todos)
        .filter(Todos.id == todo_id)
        .filter(Todos.id == user.get("id"))
        .first()
    )

    if todo_model is not None:
        return todo_model
    raise http_exception()


@router.post("/create_todo")
async def create_todo(
    todo: Todo,
    user: Dict[str, Any | None] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.get("id") is None:
        raise get_user_exception()
    new_todo = Todos(title=todo.title, complete=todo.complete, owner_id=user.get("id"))
    db.add(new_todo)
    db.commit()
    db.refresh(new_todo)
    return new_todo


@router.put("/{todo_id}")
async def update_todo(
    todo_id: int,
    todo: Todo,
    user: Dict[str, Any | None] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.get("id") is None:
        raise get_user_exception()

    todo_model = (
        db.query(Todos)
        .filter(Todos.id == todo_id)
        .filter(Todos.owner_id == user.get("id"))
        .first()
    )

    if todo_model is None:
        raise http_exception()
    update_todo = Todos(
        title=todo.title, complete=todo.complete, owner_id=user.get("id")
    )

    db.add(update_todo)
    db.commit()
    db.refresh(update_todo)
    return update_todo


@router.delete("/{todo_id}")
async def delete_todo(
    todo_id: int,
    user: Dict[str, Any | None] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if user.get("id") is None:
        raise get_user_exception()

    todo_model = (
        db.query(Todos)
        .filter(Todos.id == todo_id)
        .filter(Todos.owner_id == user.get("id"))
        .first()
    )

    if todo_model is None:
        raise http_exception()

    db.query(Todos).filter(Todos.id == todo_id).delete()

    db.commit()

    return {"status": 200, "message": "Todo Deleted Successfuly"}
