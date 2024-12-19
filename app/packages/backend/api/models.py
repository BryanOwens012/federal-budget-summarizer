from pydantic import BaseModel
from typing import List

class Product(BaseModel):
    id: str
    name: str
    priceCents: int

class ProductList(BaseModel):
    products: List[Product]