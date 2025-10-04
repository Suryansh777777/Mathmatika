"""
AI-powered Manim code generation using OpenRouter (Llama models).
"""

import re
import logging
from typing import Optional
import requests
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# OpenRouter configuration
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')
OPENROUTER_MODEL = os.getenv('OPENROUTER_MODEL', 'meta-llama/llama-3.2-11b-vision-instruct:free')
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Check if API key is available
if not OPENROUTER_API_KEY:
    logger.warning("OPENROUTER_API_KEY not found in environment variables")


async def extract_code_from_response(text: str) -> str:
    """Extract Python code from AI response."""
    if not text:
        return ""
    # Try fenced code blocks with language
    m = re.search(r"```(?:python)?\n([\s\S]*?)```", text, re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return text.strip()


async def generate_manim_prompt(concept: str) -> str:
    """Generate a detailed prompt for GPT to create Manim code."""
    return f"""Create a detailed Manim animation to demonstrate and explain: {concept}

Create a Scene class named MainScene that follows these requirements:

1. Scene Setup:
   - For 3D concepts: Use ThreeDScene with appropriate camera angles
   - For 2D concepts: Use Scene with NumberPlane when relevant
   - Add title and clear mathematical labels

2. Mathematical Elements:
   - Use MathTex for equations with proper LaTeX syntax
   - Include step-by-step derivations when showing formulas
   - Add mathematical annotations and explanations
   - Show key points and important relationships

3. Visual Elements:
   - Create clear geometric shapes and diagrams
   - Use color coding to highlight important parts
   - Add arrows or lines to show relationships
   - Include coordinate axes when relevant

4. Animation Flow:
   - Break down complex concepts into simple steps
   - Use smooth transitions between steps
   - Add pauses (self.wait()) at key moments
   - Use transform animations to show changes

5. Specific Requirements:
   - For equations: Show step-by-step solutions
   - For theorems: Visualize proof steps
   - For geometry: Show construction process
   - For 3D: Include multiple camera angles
   - For graphs: Show coordinate system and gridlines

6. Code Structure:
   - Import required Manim modules
   - Use proper class inheritance
   - Define clear animation sequences
   - Include helpful comments

Example structure:
```python
from manim import *

class MainScene(Scene):  # or ThreeDScene for 3D
    def construct(self):
        # 1. Setup and introduction
        title = Title("Concept Name")
        
        # 2. Create mathematical objects
        equation = MathTex(r"your_equation")
        
        # 3. Create geometric objects
        shapes = VGroup(...)
        
        # 4. Add annotations
        labels = VGroup(...)
        
        # 5. Animate step by step
        self.play(Write(title))
        self.play(Create(shapes))
        
        # 6. Show relationships
        self.play(Transform(...))
        
        # 7. Conclude
        self.wait()
```

Only output valid Manim Python code without any additional text or markdown."""


async def generate_ai_manim_code(concept: str) -> Optional[str]:
    """Generate Manim code using OpenRouter Llama models."""
    if not OPENROUTER_API_KEY:
        logger.error("OpenRouter API key not available")
        return None
    
    try:
        sys_prompt = (
            "You are a senior Manim expert. Generate only valid Python code for Manim. "
            "Create a scene class named MainScene (or ThreeDScene when appropriate). "
            "Use MathTex for any mathematical expressions. Do not include markdown."
        )
        user_prompt = await generate_manim_prompt(concept)
        
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",  # Optional but recommended
            "X-Title": "Manim Generator"  # Optional
        }
        
        data = {
            "model": OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 1200,
        }
        
        response = requests.post(
            f"{OPENROUTER_BASE_URL}/chat/completions",
            headers=headers,
            json=data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
            code = await extract_code_from_response(content)
            return code if code else None
        else:
            logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
            return None
        
    except Exception as e:
        logger.error(f"AI generation failed: {e}")
        return None