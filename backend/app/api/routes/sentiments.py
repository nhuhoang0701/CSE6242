from typing import Any, List

import polars as pl
from app.api.deps import SessionDep
from app.models import Post, Sentiment
from app.utils import get_data, get_posts
from fastapi import APIRouter

router = APIRouter()


@router.get("/", response_model=List[Post])
def get_sentiments_by_state(session: SessionDep, keyword: str, year: int) -> Any:
    df = get_data()
    df = df.filter(pl.col("Year") == year)

    posts = get_posts(df, [keyword])
    return [
        Post(
            state=post["state"],
            text=post["text"],
            sentiment=Sentiment(
                negative=post["negative"],
                positive=post["positive"],
                neutral=post["neutral"],
            ),
        )
        for post in posts
    ]
