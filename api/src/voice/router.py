"""
FastAPI router for voice endpoints.
"""

from fastapi import APIRouter, File, UploadFile, HTTPException
from fastapi.responses import StreamingResponse

from src.voice.models import TextToSpeechRequest, SpeechToTextResponse
from src.voice.service import VoiceService

# Create router with prefix
router = APIRouter(
    prefix="/voice",
    tags=["voice"],
    responses={404: {"description": "Not found"}},
)

# Initialize service
voice_service = VoiceService()

@router.post("/text-to-speech")
async def text_to_speech(request: TextToSpeechRequest):
    """
    Convert text to speech with streaming audio response.

    - **text**: Text to convert to speech (max 4096 characters)
    - **voice**: Voice option (alloy, echo, fable, onyx, nova, shimmer)
    - **model**: TTS model - tts-1 (faster) or tts-1-hd (higher quality)
    - **speed**: Speech speed from 0.25 to 4.0

    Returns streaming MP3 audio data.
    """
    try:
        return StreamingResponse(
            voice_service.text_to_speech_stream(request),
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "inline; filename=speech.mp3",
                "Cache-Control": "no-cache",
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/speech-to-text", response_model=SpeechToTextResponse)
async def speech_to_text(audio: UploadFile = File(...)):
    """
    Transcribe audio to text using Whisper.

    - **audio**: Audio file (mp3, mp4, mpeg, mpga, m4a, wav, webm)

    Returns transcribed text and detected language.
    """
    try:
        # Validate file type
        allowed_types = ["audio/mpeg", "audio/mp4", "audio/wav", "audio/webm", "audio/m4a"]
        if audio.content_type not in allowed_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid audio format. Allowed: {', '.join(allowed_types)}"
            )

        # Process transcription
        result = await voice_service.speech_to_text(audio.file)

        return SpeechToTextResponse(
            text=result["text"],
            language=result["language"]
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
