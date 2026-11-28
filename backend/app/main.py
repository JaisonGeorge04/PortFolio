"""FastAPI application exposing health and portfolio chat endpoints."""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.schemas import ChatRequest, ChatResponse
from app.services.gemini_service import (
    GeminiServiceError,
    MissingGeminiAPIKey,
    generate_reply,
)


settings = get_settings()

app = FastAPI(title="Jaison George Portfolio Chat API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
)


@app.get("/health")
async def health() -> dict[str, str]:
    """Report that the API process is running (independent of Gemini credentials)."""

    return {"status": "ok"}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    """Generate a portfolio grounded answer."""

    try:
        reply = await generate_reply(request.message, request.history)
    except MissingGeminiAPIKey:
        raise HTTPException(
            status_code=503,
            detail="Chat is not configured yet. The server administrator must set GEMINI_API_KEY.",
        ) from None
    except GeminiServiceError:
        raise HTTPException(
            status_code=502,
            detail="The AI assistant is temporarily unavailable. Please try again shortly.",
        ) from None
    return ChatResponse(reply=reply)
