import dataclasses
import datetime
from typing import Optional, List
import uuid
from pydantic import BaseModel
from db.models import Product

class ProductList(BaseModel):
    products: List[Product]
