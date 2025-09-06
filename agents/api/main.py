from fastapi import FastAPI
from pydantic import BaseModel
import os

app = FastAPI(title="LUDUS Agents API")


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    language: str | None = "ar"


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/chat")
async def chat(req: ChatRequest):
    # Placeholder logic; to be replaced with AutoGen/Redis pipeline
    reply = f"Echo: {req.message}"
    return {"reply": reply, "language": req.language, "session_id": req.session_id}
