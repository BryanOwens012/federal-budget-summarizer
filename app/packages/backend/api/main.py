from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import products

app = FastAPI()

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

# Include the router
app.include_router(products.router, prefix="/products")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run('.:app', host='0.0.0.0', port=8000, reload=True, access_log=False)