import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(
    title=os.getenv("API_TITLE", "{{PROJECT_NAME}}"),
    description=os.getenv("API_DESCRIPTION", "FastAPI Agentic project"),
    version=os.getenv("API_VERSION", "0.1.0"),
)

# CORS middleware
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {
        "message": "🚀 Welcome to {{PROJECT_NAME}}",
        "description": "FastAPI Agentic project from Relay Factory",
    }


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "{{PROJECT_NAME}}",
    }


@app.get("/api/v1/info")
async def api_info():
    return {
        "version": os.getenv("API_VERSION", "0.1.0"),
        "environment": os.getenv("DEBUG", "production"),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 3000)),
        reload=os.getenv("DEBUG", True),
    )
