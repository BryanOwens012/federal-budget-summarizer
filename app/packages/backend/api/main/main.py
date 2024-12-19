from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import logging
import os

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Get allowed origins from environment variable or use defaults
allowed_origins = os.getenv('CORS_ORIGINS', 'http://localhost:3000,http://frontend:3000').split(',')
logger.info(f"Configured allowed origins: {allowed_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins + [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
        "http://frontend:3000",  # Docker service name
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request from: {request.client.host}")
    logger.info(f"Method: {request.method}, URL: {request.url}")
    logger.info(f"Headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    logger.info(f"Response status: {response.status_code}")
    return response

@app.get("/products")
async def read_products(request: Request):
    logger.info("Processing /products request")
    return {
        "products": [
            {"id": "1", "name": "Apple", "priceCents": 123}
        ]
    }