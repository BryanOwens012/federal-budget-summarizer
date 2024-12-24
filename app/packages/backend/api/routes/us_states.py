from fastapi import APIRouter
from db.models import UsState
from typing import List
import db.us_states
import pydantic
from utils.querier import get_conn

router = APIRouter()

class USStatesList(pydantic.BaseModel):
    us_states: List[UsState]

@router.get("", response_model=USStatesList)
async def list_us_states():
    print("Listing U.S. states")
    with get_conn() as conn:
        q = db.us_states.Querier(conn)
        return USStatesList(us_states = q.list_us_states())