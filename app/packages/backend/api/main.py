from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from querier import engine
from sqlalchemy import text

import routes.products
import routes.ai

@asynccontextmanager
async def lifespan(_: FastAPI):
    # Startup: Test database connection before the application starts accepting requests
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print("Successfully connected to the database!")
    except Exception as e:
        print(f"Failed to connect to the database: {str(e)}")
        raise
    
    yield  # This line separates startup and shutdown logic

app = FastAPI(lifespan=lifespan)

# CORS middleware setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://0.0.0.0:3000",
        "http://frontend:3000",  # Docker service name
    ],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=False,
)

# Include the routers
app.include_router(routes.products.router, prefix="/v1/products")
app.include_router(routes.ai.router, prefix="/v1/ai")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(".:app", host="0.0.0.0", port=8000, reload=True, access_log=False)