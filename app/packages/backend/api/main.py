from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from utils.querier import engine
from sqlalchemy import text
import os
from datetime import datetime

import routes.us_states
import routes.ai

from entrypoint import run

@asynccontextmanager
async def lifespan(_: FastAPI):
    # Startup: Test database connection before the application starts accepting requests
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(f"{datetime.now()} Successfully connected to the database!")
    except Exception as e:
        print(f"{datetime.now()} Failed to connect to the database: {str(e)}")
        raise

    # Startup: Initialize caches
    try:
        routes.us_states.init_caches()
        routes.ai.init_caches()
    except Exception as e:
        print(f"{datetime.now()} Failed to initialize caches: {str(e)}")
        raise
    
    yield  # This line separates startup and shutdown logic

app = FastAPI(lifespan=lifespan)

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
         # Allow 3001, in case we want to run the frontend both in Docker ($ yarn build && yarn start)
         # and by itself ($ yarn run dev), simultaneously
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://0.0.0.0:3000",
        "http://frontend:3000",  # Docker service name
        "http://frontend:3001",
        os.getenv("NEXT_PUBLIC_RAILWAY_FE_URL", "http://localhost:3000"),
        os.getenv("RAILWAY_PUBLIC_DOMAIN", "http://localhost:3000"),
        os.getenv("RAILWAY_PRIVATE_DOMAIN", "http://localhost:3000"),
        os.getenv("RAILWAY_SERVICE_NAME", "http://localhost:3000"),
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

# Include the routers
app.include_router(routes.us_states.router, prefix="/v1/us-states")
app.include_router(routes.ai.router, prefix="/v1/ai")

print(f"{datetime.now()} Backend API started")

if __name__ == "__main__":
    run()