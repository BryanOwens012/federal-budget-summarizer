import uvicorn
from datetime import datetime

def run():
    print(f"{datetime.now()} Running the FastAPI app")
    uvicorn.run(
        "main:app",
        host="0.0.0.0", 
        port=8000,
        log_level="info",
        reload=True
    )

if __name__ == "__main__":
   run()