# Code generated by sqlc. DO NOT EDIT.
# versions:
#   sqlc v1.27.0
import datetime
import pydantic
from typing import Optional


class UsState(pydantic.BaseModel):
    id: int
    name: Optional[str]
    createdat: Optional[datetime.datetime]
    updatedat: Optional[datetime.datetime]
