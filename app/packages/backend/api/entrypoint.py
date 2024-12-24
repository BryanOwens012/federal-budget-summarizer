import uvicorn

def run():
    uvicorn.run(
        "main:app",
        host="0.0.0.0", 
        port=8000,
        log_level="info",
        reload=True
    )

if __name__ == "__main__":
   run()