from fastapi import APIRouter
from db.models import Product
from typing import List
import db.products

router = APIRouter()

querier = db.products.Querier()

@router.get("", response_model=List[Product])
async def read_products():
    return querier.list_products()