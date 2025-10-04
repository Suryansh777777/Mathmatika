"""
Core Voice service for TTS and STT.
"""

import os
from typing import AsyncGenerator
from openai import OpenAI
from dotenv import load_dotenv

from src.voice.models import TextToSpeechRequest

# Load environment variables from .env file
load_dotenv()

# Get API key from environment
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Check if API key is set
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY must be set in .env file for voice functionality")

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

class VoiceService:
    """Service for handling voice operations."""

    async def text_to_speech_stream(self, request: TextToSpeechRequest) -> AsyncGenerator[bytes, None]:
        """
        Stream text-to-speech audio from OpenAI.

        Args:
            request: TextToSpeechRequest with text and voice settings

        Yields:
            Audio bytes chunks for streaming
        """
        try:
            # Create streaming TTS request
            response = client.audio.speech.create(
                model=request.model,
                voice=request.voice,
                input=request.text,
                speed=request.speed,
                response_format="mp3"
            )

            # Stream the audio chunks
            for chunk in response.iter_bytes(chunk_size=4096):
                yield chunk

        except Exception as e:
            raise RuntimeError(f"TTS streaming error: {str(e)}")

    async def speech_to_text(self, audio_file) -> dict:
        """
        Transcribe audio to text using OpenAI Whisper.

        Args:
            audio_file: Audio file object from request

        Returns:
            Dictionary with 'text' and 'language' keys
        """
        try:
            # Create transcription request
            transcription = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json"
            )

            return {
                "text": transcription.text,
                "language": transcription.language or ""
            }

        except Exception as e:
            raise RuntimeError(f"STT error: {str(e)}")
