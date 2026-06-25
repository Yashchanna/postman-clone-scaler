# Postman Clone - API Client Platform

A full-stack Postman clone built as an SDE Fullstack assignment.

## Architecture

* **Frontend:** Next.js (TypeScript), Zustand (State Management), Vanilla CSS (Postman Dark Theme), `react-resizable-panels`.
* **Backend:** FastAPI (Python), SQLAlchemy (SQLite), HTTPX (for proxying requests).

## Setup & Run Locally

### 1. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Run the server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*The database will be automatically seeded with sample Collections and Environments on the first run.*

### 2. Frontend Setup

```bash
cd frontend
npm install

# Set the API URL to point to your local backend
# On Windows PowerShell:
$env:NEXT_PUBLIC_API_URL="http://localhost:8000"; npm run dev

# On Mac/Linux:
NEXT_PUBLIC_API_URL="http://localhost:8000" npm run dev
```

Visit `http://localhost:3000` to use the application.

## Deployment

### Backend (Render)
The `backend` directory includes a `Dockerfile` and `render.yaml` for zero-configuration deployment to Render (Free Tier). 
1. Connect your GitHub repository to Render.
2. Select "Blueprint" and point it to the `backend/render.yaml` file.

### Frontend (Vercel)
The `frontend` directory is a standard Next.js application that can be deployed to Vercel with zero configuration.
1. Connect your GitHub repository to Vercel.
2. Set the Root Directory to `frontend`.
3. Add the `NEXT_PUBLIC_API_URL` environment variable pointing to your deployed backend URL.

## Features Implemented
- Dynamic, resizable 3-pane UI layout matching Postman
- Real HTTP requests execution with robust backend proxy (bypasses CORS)
- Global state management for open tabs, request building, response viewing
- Collections CRUD with nested tree view
- Environments CRUD with variable resolution (`{{var}}` in URL, headers, body)
- Automatic request history tracking
