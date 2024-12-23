from fastapi import APIRouter
from db.models import Product
from typing import List
import db.products
import pydantic
from querier import get_conn

router = APIRouter()

class ProductList(pydantic.BaseModel):
    products: List[Product]

@router.get('', response_model=ProductList)
async def list_products():
    with get_conn() as conn:
        q = db.products.Querier(conn)
        return ProductList(products = q.list_products())