from typing import Dict

from sqlmodel import Field, SQLModel


class CollegeWordCloud(SQLModel):
    state: str = Field(max_length=100)
    college_name: str = Field(max_length=200)
    words: Dict = Field()
    keyword: str = Field(max_length=100)


class StateWordCloud(SQLModel):
    state: str = Field(max_length=100, unique=True)
    words: Dict = Field()
    keyword: str = Field(max_length=100)
