from typing import Any

from app.api.deps import SessionDep
from app.models import CollegeWordList, StateWordlist
from app.utils import get_data
from fastapi import APIRouter

router = APIRouter()


@router.get("/state", response_model=StateWordlist)
def get_keywords(session: SessionDep, state_name: str) -> Any:
    """
    Retrieve users.
    """

    df = get_data()
    df.head()

    return StateWordlist()


@router.get("/college", response_model=CollegeWordList)
def get_keywords(session: SessionDep, state_name: str) -> Any:
    """
    Retrieve users.
    """

    df = get_data()
    df.head()

    return CollegeWordList()
