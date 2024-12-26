from fastapi import APIRouter
from db.models import UsState
from typing import List
import db.us_states
import pydantic
from utils.querier import get_conn
from datetime import datetime

router = APIRouter()

class USStatesList(pydantic.BaseModel):
    us_states: List[UsState]

# TODO: Replace with Redis cache
us_states_cache = USStatesList(us_states = [])

async def init_caches():
    print(f"{datetime.now()} Pre-caching U.S. states")
    us_states_cache.us_states = await list_us_states()

@router.get("", response_model=USStatesList)
async def list_us_states():
    print(f"{datetime.now()} Listing U.S. states")

    if us_states_cache.us_states:
        print(f"{datetime.now()} Found U.S. states in cache")
        return USStatesList(us_states = us_states_cache.us_states)

    with get_conn() as conn:
        q = db.us_states.Querier(conn)
        return USStatesList(us_states = q.list_us_states())