from typing import Any

import polars as pl
from app.api.deps import SessionDep
from app.models import MapSentiment, Sentiment
from app.utils import get_data, get_map_sentiment
from fastapi import APIRouter

router = APIRouter()


@router.get("/", response_model=MapSentiment)
def get_state_word_cloud(session: SessionDep, keyword: str, year: int) -> Any:
    df = get_data()
    df = df.filter(pl.col("Year") == year)

    sentiment_by_state = get_map_sentiment(df, [keyword])
    return MapSentiment(sentiment_by_state=sentiment_by_state)
