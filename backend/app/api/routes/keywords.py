from typing import Any

import polars as pl
from app.api.deps import SessionDep
from app.models import CollegeWordCloud, StateWordCloud
from app.utils import (
    get_college_df,
    get_posts_containing_keywords,
    get_state_df,
    topic_model,
)
from fastapi import APIRouter

router = APIRouter()


@router.get("/state", response_model=StateWordCloud)
def get_state_word_cloud(
    session: SessionDep, state: str, keyword: str, year: int
) -> Any:
    df = get_state_df(state, year)

    posts = get_posts_containing_keywords(df, [keyword])
    prob_by_word = topic_model(posts)

    return StateWordCloud(state=state, words=prob_by_word, keyword=keyword)


@router.get("/college", response_model=CollegeWordCloud)
def get_college_word_cloud(
    session: SessionDep, college_name: str, keyword: str, year: int
) -> Any:
    df = get_college_df(college_name, year)

    if df.empty:
        return CollegeWordCloud(
            state="", college_name=college_name, words={}, keyword=keyword
        )

    state = df["State"].iloc[0]
    df = df[df["Year"] == year]

    posts = get_posts_containing_keywords(df, [keyword])
    prob_by_word = topic_model(posts)

    return CollegeWordCloud(
        state=state, college_name=college_name, words=prob_by_word, keyword=keyword
    )
