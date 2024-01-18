from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from api.db.db_connection import get_db
from api.db.modals import Todos
from api.router.auth import get_current_user, get_user_exception


class Todo(BaseModel):
    title: str
    complete: bool


class CreateTodo(BaseModel):
    title: str
    complete: Optional[bool]


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
    todo = (
        db.query(Todos)
        .filter(Todos.id == todo_id)
        .filter(Todos.owner_id == user.get("id"))
        .first()
    )
    print(todo)
    if todo is not None:
        return todo
    raise http_exception()


@router.post("/create_todo")
async def create_todo(
    todo: CreateTodo,
    user: Dict[str, Any | None] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        if user.get("id") is None:
            raise get_user_exception()
        new_todo = Todos(
            title=todo.title, complete=todo.complete, owner_id=user.get("id")
        )
        db.add(new_todo)
        db.commit()
        db.refresh(new_todo)
        return new_todo
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error Creating TODO : {e}")
        raise


@router.put("/{todo_id}")
async def update_todo(
    todo_id: int,
    todo: Todo,
    user: Dict[str, Any | None] = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        if user.get("id") is None:
            raise get_user_exception()
        get_todo = (
            db.query(Todos)
            .filter(Todos.id == todo_id)
            .filter(Todos.owner_id == user.get("id"))
            .first()
        )
        if get_todo is None:
            raise http_exception()

        update_todo = todo.model_dump(exclude_unset=True)

        for key, value in update_todo.items():
            setattr(get_todo, key, value)

        db.commit()
        return update_todo

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error Updating TODO item: {e}")
        raise


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
