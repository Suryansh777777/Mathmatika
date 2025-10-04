"""
LiveKit Voice Agent Worker for RAG-powered mentor.

This agent connects to LiveKit rooms and provides voice interaction
with RAG context from Pinecone embeddings.
"""

import asyncio
import json
import logging
from typing import Annotated

from livekit.agents import (
    AutoSubscribe,
    JobContext,
    WorkerOptions,
    cli,
    llm,
)
from livekit.agents.voice_assistant import VoiceAssistant
from livekit.plugins import deepgram, openai, silero
from dotenv import load_dotenv

# Import RAG service
from src.rag.service import RAGService

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def entrypoint(ctx: JobContext):
    """
    Main agent entrypoint.

    This function is called when a participant joins a room.
    It initializes the voice assistant and connects it to the room.
    """
    logger.info(f"Starting voice agent for room: {ctx.room.name}")

    # Initialize RAG service
    rag_service = RAGService()

    # Get index name from participant metadata
    # The token metadata contains the RAG index to query
    index_name = "pdf-index"  # default

    # Try to get index from room participants
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    # Get metadata from local participant (the user/student)
    for participant in ctx.room.remote_participants.values():
        if participant.metadata:
            try:
                metadata = json.loads(participant.metadata)
                index_name = metadata.get("index_name", index_name)
                logger.info(f"Using RAG index: {index_name}")
            except json.JSONDecodeError:
                logger.warning("Could not parse participant metadata")

    # Create system prompt for the mentor
    system_prompt = f"""You are a helpful and patient mentor who teaches students about topics from educational materials.

Your role:
- Answer questions based ONLY on the provided context from the knowledge base
- Explain concepts clearly and concisely
- If the context doesn't contain the answer, say so honestly
- Be encouraging and supportive
- Use simple language appropriate for learning

Current knowledge base index: {index_name}

Remember: You are having a VOICE conversation, so keep responses concise and natural for speaking."""

    async def answer_with_rag(
        chat_ctx: llm.ChatContext,
    ):
        """
        Generate answer using RAG context.

        This function is called by the voice assistant when the user speaks.
        """
        # Get the user's last message
        user_msg = chat_ctx.messages[-1]
        user_question = user_msg.content if hasattr(user_msg, 'content') else str(user_msg)

        logger.info(f"User question: {user_question}")

        try:
            # Query RAG service for relevant documents
            docs = await rag_service.query_documents(user_question, index_name, k=3)

            if not docs:
                response_text = "I'm sorry, I don't have any information about that in my knowledge base. Could you try rephrasing your question?"
            else:
                # Build context from retrieved documents
                context = "\n\n".join([doc.page_content for doc in docs])

                # Build prompt with context
                prompt = f"""Context from knowledge base:
{context}

Student question: {user_question}

Please answer the question based on the context above. Keep your response concise and natural for a voice conversation."""

                # Generate response using Cerebras
                response_text = await rag_service.generate_response(prompt)

            logger.info(f"Mentor response: {response_text}")

            # Add assistant response to chat context
            chat_ctx.messages.append(llm.ChatMessage(role="assistant", content=response_text))

        except Exception as e:
            logger.error(f"Error generating response: {e}")
            response_text = "I'm sorry, I encountered an error while trying to answer your question. Could you please try again?"
            chat_ctx.messages.append(llm.ChatMessage(role="assistant", content=response_text))

    # Initialize voice assistant
    assistant = VoiceAssistant(
        vad=silero.VAD.load(),        # Voice activity detection
        stt=deepgram.STT(),            # Speech-to-text (Deepgram)
        llm=llm.FunctionContext(),     # We'll handle LLM manually with RAG
        tts=openai.TTS(               # Text-to-speech (OpenAI)
            voice="alloy",             # Use a pleasant voice
            speed=1.0,
        ),
        chat_ctx=llm.ChatContext().append(
            role="system",
            text=system_prompt,
        ),
        fnc_ctx=llm.FunctionContext(),
        will_synthesize_assistant_reply=answer_with_rag,
    )

    # Start the assistant
    assistant.start(ctx.room)

    logger.info("Voice assistant started successfully")

    # Keep the agent running
    await asyncio.sleep(10000)  # Keep alive


if __name__ == "__main__":
    # Run the agent worker
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            agent_name="rag-mentor",
        )
    )
