# {{PROJECT_NAME}}

FastAPI Agentic REST API bootstrapped from **Relay Factory**.

## Quick Start

```bash
# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate          # On Windows: .\.venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env and add your API keys

# Run development server
uvicorn app.main:app --reload --port 3000
```

The API will be running at [http://localhost:3000](http://localhost:3000).

## Features

- ⚡ **FastAPI** - Modern, fast web framework for building APIs
- 🤖 **Kimi K2 Agent** integration for intelligent automation
- 🗄️ **SQLModel** with PostgreSQL support
- 🔐 **JWT Authentication** ready
- 📝 **Pydantic** for data validation
- ✅ **Async/Await** support
- 📊 **CORS** enabled and configurable

## Environment Setup

### 1. Database
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/{{PROJECT_NAME}}
```

### 2. Security
```bash
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 3. AI Agents
```bash
# Kimi K2 (Main Agent)
KIMI_API_KEY=your-api-key
K2_PROVIDER=kimi
K2_MODEL=kimi-9b

# Gemini (for MCP subagent)
GOOGLE_GEMINI_API_KEY=your-api-key
```

## Project Structure

```
app/
├── main.py           # Application entry point
├── __init__.py
├── api/              # API routes
│   ├── __init__.py
│   ├── v1/
│   │   ├── __init__.py
│   │   └── endpoints/
│   └── deps.py       # Dependencies
├── models/           # SQLModel models
├── schemas/          # Pydantic schemas
├── crud/             # CRUD operations
├── db/               # Database configuration
└── core/             # Core utilities
tests/                # Test files
```

## Creating a Feature

### 1. Define SQLModel

```python
# app/models/user.py
from sqlmodel import SQLModel, Field
from typing import Optional

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str
```

### 2. Create Schema

```python
# app/schemas/user.py
from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
```

### 3. Add CRUD

```python
# app/crud/user.py
from app.models import User

async def create_user(db, user_data):
    db_user = User(**user_data.dict())
    db.add(db_user)
    db.commit()
    return db_user
```

### 4. Create Endpoint

```python
# app/api/v1/endpoints/users.py
from fastapi import APIRouter

router = APIRouter()

@router.post("/users")
async def create_user(user: UserCreate):
    return await create_user(db, user)
```

## Testing

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app

# Run specific test file
pytest tests/test_api.py -v
```

## Deployment

### Docker

```bash
docker build -t {{PROJECT_NAME}} .
docker run -p 3000:3000 {{PROJECT_NAME}}
```

### Railway

```bash
railway up
```

### Fly.io

```bash
flyctl launch
flyctl deploy
```

## Learn More

- [FastAPI Documentation](https://fastapi.tiangolo.com)
- [SQLModel Docs](https://sqlmodel.tiangolo.com)
- [Pydantic Documentation](https://docs.pydantic.dev)
- [PostgreSQL](https://www.postgresql.org)

## License

MIT
