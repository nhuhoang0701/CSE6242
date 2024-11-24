from typing import Dict, List

from sqlmodel import Field, SQLModel


class StateWordCloud(SQLModel):
    state: str = Field()
    words: Dict = Field()
    keyword: str = Field()


class CollegeWordCloud(SQLModel):
    college_name: str = Field()


class StateEmotions(SQLModel):
    state: str = Field()
    keyword: str = Field()
    predicted_emotions: List[str] = (Field(),)
    emotion_counts: Dict = Field()


class CollegeEmotions(StateEmotions):
    college_name: str = Field()


class Sentiment(SQLModel):
    negative: float = Field()
    positive: float = Field()
    neutral: float = Field()


class MapSentiment(SQLModel):
    sentiment_by_state: Dict = Field()
