from fastapi import APIRouter
from models import ProductList, Product

router = APIRouter()

@router.get("", response_model=ProductList)
async def read_products():
    return ProductList(
        products=[
            Product(id="1", name="Apple", priceCents=123)
        ]
    )