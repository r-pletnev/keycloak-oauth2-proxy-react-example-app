from typing import Optional
from pydantic import BaseModel


class Author(BaseModel):
    name: str
    email: str


class PostMeta(BaseModel):
    title: str
    definitions: list[str]
    authors: list[Author]


class PostPicture(BaseModel):
    name: str
    url: str
    metas: Optional[PostMeta] = None


class Backlink(BaseModel):
    date: str
    url: str


class Post(BaseModel):
    id: int
    title: str
    teaser: str
    views: int
    average_note: Optional[float] = None
    commentable: Optional[bool] = False
    pictures: Optional[list[PostPicture]] = []
    published_at: str
    tags: list[int]
    category: str
    subcategory: Optional[str] = None
    backlinks: Optional[list[Backlink]] = []
