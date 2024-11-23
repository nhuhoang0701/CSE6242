from typing import Any

from app.api.deps import SessionDep
from app.models import StateWordlist
from fastapi import APIRouter

router = APIRouter()


@router.get("/state", response_model=StateWordlist)
def read_users(session: SessionDep, state_name: str) -> Any:
    """
    Retrieve users.
    """

    return StateWordlist()
