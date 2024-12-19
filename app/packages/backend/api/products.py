from fastapi import APIRouter
from db.models import Product
from typing import List

router = APIRouter()

@router.get("", response_model=List[Product])
async def read_products():
    return [
        Product(id="1", name="Apple", priceCents=123),
    ]