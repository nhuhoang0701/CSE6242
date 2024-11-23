from typing import Dict, List

from sqlmodel import Field, SQLModel


class StateWordCloud(SQLModel):
    state: str = Field(max_length=100, unique=True)
    words: Dict = Field()
    keyword: str = Field(max_length=100)


class CollegeWordCloud(SQLModel):
    college_name: str = Field(max_length=200)


class StateEmotions(SQLModel):
    state: str = Field(max_length=100, unique=True)
    keyword: str = Field(max_length=100)
    predicted_emotions: List[str] = (Field(),)
    emotion_counts: Dict = Field()


class CollegeEmotions(StateEmotions):
    college_name: str = Field(max_length=200)
