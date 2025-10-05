"""
Pydantic models for Manim animation generation API.
"""

from typing import Optional, Literal
from pydantic import BaseModel, Field


class ManimGenerateRequest(BaseModel):
    """Request model for generating Manim animations."""
    
    concept: str = Field(
        ...,
        description="Mathematical concept or LaTeX expression to animate",
        min_length=1,
        max_length=1000,
        examples=["pythagorean theorem", "\\frac{d}{dx}(x^2) = 2x", "3D surface plot"]
    )
    quality: Literal["low", "medium", "high"] = Field(
        default="low",
        description="Render quality for the animation"
    )


class ManimGenerateResponse(BaseModel):
    """Response model for Manim animation generation."""
    
    success: bool = Field(
        ...,
        description="Whether the animation was successfully generated"
    )
    video_url: Optional[str] = Field(
        None,
        description="URL path to the generated video file"
    )
    code: Optional[str] = Field(
        None,
        description="The Manim Python code that was executed"
    )
    used_ai: bool = Field(
        default=False,
        description="Whether AI was used to generate the code"
    )
    render_quality: str = Field(
        ...,
        description="The quality level used for rendering"
    )
    error: Optional[str] = Field(
        None,
        description="Error message if generation failed"
    )
    details: Optional[str] = Field(
        None,
        description="Additional error details if available"
    )