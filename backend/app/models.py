from typing import Dict, List

from sqlmodel import SQLModel


class StateWordCloud(SQLModel):
    state: str
    words: Dict
    keyword: str


class CollegeWordCloud(StateWordCloud):
    college_name: str


class StateEmotions(SQLModel):
    state: str
    keyword: str
    predicted_emotions: List[str]
    emotion_counts: Dict


class CollegeEmotions(StateEmotions):
    college_name: str


class Sentiment(SQLModel):
    negative: float
    positive: float
    neutral: float


class Post(SQLModel):
    state: str
    # text: str
    sentiment: Sentiment
