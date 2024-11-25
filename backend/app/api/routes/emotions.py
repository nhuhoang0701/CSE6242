from collections import Counter
from typing import Any

import polars as pl
from app.api.deps import SessionDep
from app.models import CollegeEmotions, CollegeWordCloud, StateEmotions, StateWordCloud
from app.utils import (
    get_college_df,
    get_posts_containing_keywords,
    get_state_df,
    predict_emotion,
    topic_model,
)
from fastapi import APIRouter
from tqdm import tqdm

router = APIRouter()


@router.get("/state", response_model=StateEmotions)
def get_state_emotions(session: SessionDep, state: str, keyword: str, year: int) -> Any:
    df = get_state_df(state, year)
    posts = get_posts_containing_keywords(df, [keyword])

    answers = []
    emotion_counts = Counter()
    emotions = {
        0: "anger",
        1: "anticipation",
        2: "disgust",
        3: "fear",
        4: "joy",
        5: "love",
        6: "optimism",
        7: "pessimism",
        8: "sadness",
        9: "surprise",
        10: "trust",
    }

    for text in tqdm(posts, desc="Processing Posts"):
        e = predict_emotion(text)
        answers.append(emotions[e])
        emotion_counts[emotions[e]] += 1

    return StateEmotions(
        state=state,
        keyword=keyword,
        predicted_emotions=answers,
        emotion_counts=dict(emotion_counts),
    )


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

    answers = []
    emotion_counts = Counter()
    emotions = {
        0: "anger",
        1: "anticipation",
        2: "disgust",
        3: "fear",
        4: "joy",
        5: "love",
        6: "optimism",
        7: "pessimism",
        8: "sadness",
        9: "surprise",
        10: "trust",
    }
    for text in posts:
        e = predict_emotion(text)
        answers.append(emotions[e])
        emotion_counts[emotions[e]] += 1

    return CollegeEmotions(
        state=state,
        college_name=college_name,
        keyword=keyword,
        predicted_emotions=answers,
        emotion_counts=dict(emotion_counts),
    )
