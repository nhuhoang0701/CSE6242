import uuid
from datetime import datetime, timezone
from typing import Dict, Optional

from sqlmodel import Field, Relationship, SQLModel


class CollegeWordList(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)
    state: str = Field(max_length=100)
    college_name: str = Field(max_length=200)
    word_list: Optional[Dict] = Field(default=dict)
    keyword: Optional[str] = Field(max_length=100, default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StateWordlist(SQLModel):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(max_length=100, unique=True)
    word_list: Optional[Dict] = Field(default=dict)
    keyword: Optional[str] = Field(max_length=100, default=None)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
