"""
Pydantic models for Voice API.
"""
from pydantic import BaseModel, Field
from typing import Literal

class TextToSpeechRequest(BaseModel):
    text: str = Field(..., description="Text to convert to speech", min_length=1, max_length=4096)
    voice: Literal["alloy", "echo", "fable", "onyx", "nova", "shimmer"] = Field(
        default="alloy",
        description="Voice to use for TTS. Options: alloy, echo, fable, onyx, nova, shimmer"
    )
    model: Literal["tts-1", "tts-1-hd"] = Field(
        default="tts-1",
        description="TTS model: tts-1 (faster) or tts-1-hd (higher quality)"
    )
    speed: float = Field(
        default=1.0,
        description="Speech speed (0.25 to 4.0)",
        ge=0.25,
        le=4.0
    )

class SpeechToTextResponse(BaseModel):
    text: str = Field(..., description="Transcribed text from audio")
    language: str = Field(default="", description="Detected language (if available)")
