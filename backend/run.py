import os
import uvicorn

if __name__ == "__main__":
    port = os.environ.get("PORT", 8000)
    host = os.environ.get("HOST", "127.0.0.1")
    uvicorn.run("app.main:app", host=host, port=port)
