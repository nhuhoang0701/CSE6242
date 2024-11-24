from typing import Any, Dict

import polars as pl
from app.api.deps import SessionDep
from app.models import Post, Sentiment
from app.utils import get_posts_df, get_state_df
from fastapi import APIRouter

router = APIRouter()


@router.get("/", response_model=Dict[str, Sentiment])
def get_sentiments(session: SessionDep, keyword: str, year: int) -> Any:

    states = [
        "Alabama",
        "Alaska",
        "Arizona",
        "Arkansas",
        "California",
        "Colorado",
        "Connecticut",
        "Delaware",
        "Florida",
        "Georgia",
        "Hawaii",
        "Idaho",
        "Illinois",
        "Indiana",
        "Iowa",
        "Kansas",
        "Kentucky",
        "Louisiana",
        "Maine",
        "Maryland",
        "Massachusetts",
        "Michigan",
        "Minnesota",
        "Mississippi",
        "Missouri",
        "Montana",
        "Nebraska",
        "Nevada",
        "New Hampshire",
        "New Jersey",
        "New Mexico",
        "New York",
        "North Carolina",
        "North Dakota",
        "Ohio",
        "Oklahoma",
        "Oregon",
        "Pennsylvania",
        "Rhode Island",
        "South Carolina",
        "South Dakota",
        "Tennessee",
        "Texas",
        "Utah",
        "Vermont",
        "Virginia",
        "Washington",
        "West Virginia",
        "Wisconsin",
        "Wyoming",
    ]

    sentiment_by_state = {}

    for state in states:
        state_df = get_state_df(state, year)
        posts_df = get_posts_df(state_df, [keyword])
        if posts_df.is_empty():
            sentiment_by_state[state] = Sentiment(positive=0, neutral=0, negative=0)
        else:
            sentiment_by_state[state] = Sentiment(
                positive=posts_df["positive"].mean(),
                neutral=posts_df["neutral"].mean(),
                negative=posts_df["negative"].mean(),
            )

    return sentiment_by_state
