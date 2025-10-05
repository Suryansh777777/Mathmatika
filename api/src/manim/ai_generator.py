"""
AI-powered Manim code generation using OpenRouter.
"""

import re
import logging
from typing import Optional, Tuple
import requests
from dotenv import load_dotenv
import os

# Import supporting services
from .lint_service import lint_code
from .prompt_refiner import refine_prompt

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
    """Generate a detailed prompt for GPT to create Manim code with smooth transitions."""
    return f"""Create a visually stunning Manim animation with smooth transitions to demonstrate: {concept}

Create a Scene class named MainScene with MANDATORY transition requirements:

1. TRANSITION EFFECTS (REQUIRED FOR EVERY ELEMENT):
   - Use FadeIn for introducing new elements (with shift, scale, or rotate)
   - Use FadeOut for removing elements (with shift, scale, or rotate)
   - Use Transform, ReplacementTransform, or TransformMatchingShapes for morphing
   - Use Succession for sequential animations
   - Use AnimationGroup for simultaneous effects
   - NEVER use plain Create/Write without transitions

2. Scene Setup with Smooth Entry:
   - For 3D: Use ThreeDScene with camera movements (move_camera)
   - For 2D: Use Scene with background fade-ins
   - Title MUST FadeIn from above: FadeIn(title, shift=UP)
   - Subtitle/description FadeIn from below

3. Mathematical Elements with Transitions:
   - Equations appear with: FadeIn(equation, shift=UP, scale=0.5)
   - Step-by-step derivations use TransformMatchingTex
   - Variables highlight with: Indicate, Flash, or Circumscribe
   - Results emphasize with: AnimationGroup(Flash, ScaleInPlace)

4. Visual Elements with Smooth Animations:
   - Shapes FadeIn with rotation: FadeIn(shape, rotate=PI/4)
   - Color changes with: shape.animate.set_color(NEW_COLOR)
   - Movement with: shape.animate.shift(direction)
   - Size changes with: shape.animate.scale(factor)

5. CRITICAL GRAPH AND AREA RULES:
   - ALWAYS create graph objects before using them:
     graph = axes.plot(lambda x: function(x))
     area = axes.get_area(graph, x_range=[a, b])
   - NEVER pass lambda directly to get_area:
     WRONG: axes.get_area(lambda x: ..., ...)
     RIGHT: graph = axes.plot(lambda x: ...); area = axes.get_area(graph, ...)
   - For Riemann rectangles: axes.get_riemann_rectangles(graph, ...)
   - For secant lines: axes.get_secant_slope_group(x_val, graph, ...)

6. Advanced Transition Patterns:
   - Chain animations: self.play(FadeIn(a), then=FadeIn(b))
   - Morph between states: Transform(old_state, new_state)
   - Replace with style: ReplacementTransform(old, new)
   - Smooth camera moves (3D): self.move_camera(phi=75*DEGREES)
   - Cross-fade between scenes: FadeOut(*self.mobjects), FadeIn(new_scene)

7. Animation Timing and Flow:
   - Use run_time parameter for pacing (1-3 seconds typically)
   - Add self.wait(0.5) between major transitions
   - Group related animations with AnimationGroup
   - Use lag_ratio for staggered effects in groups

8. Professional Polish:
   - Background elements fade in/out smoothly
   - Text appears letter by letter with AddTextLetterByLetter
   - Graphs draw with ShowCreation followed by FadeIn labels
   - Exit animations mirror entry (FadeOut with opposite shift)

MANDATORY Example Structure:
```python
from manim import *

class MainScene(Scene):  # or ThreeDScene
    def construct(self):
        # Smooth title entry
        title = Title("Concept")
        self.play(FadeIn(title, shift=DOWN, scale=0.8), run_time=1.5)
        self.wait(0.5)
        
        # Mathematical objects with transitions
        eq1 = MathTex(r"equation_1")
        eq2 = MathTex(r"equation_2")
        self.play(FadeIn(eq1, shift=UP), run_time=1)
        self.wait(0.5)
        self.play(TransformMatchingTex(eq1, eq2), run_time=1.5)
        
        # Highlight important parts
        self.play(Indicate(square), Flash(square.get_center()))
        
        # Smooth exit
        self.play(
            FadeOut(square, shift=DOWN),
            FadeOut(title, shift=UP),
            run_time=1.5
        )
```

CRITICAL RULES:
- EVERY element MUST use FadeIn/FadeOut or Transform
- NO plain Create(), Write(), or ShowCreation() without transitions
- ALWAYS specify run_time for consistent pacing
- USE shift, scale, or rotate parameters in fade animations
- CHAIN animations smoothly without abrupt changes

Only output valid Manim Python code with professional transitions."""


async def generate_openrouter_manim_code(prompt: str) -> Optional[str]:
    """Generate Manim code using OpenRouter Llama models."""
    if not OPENROUTER_API_KEY:
        return None
    
    try:
        sys_prompt = (
            "You are a senior Manim animation expert specializing in smooth, professional transitions. "
            "Generate ONLY valid Python code for Manim with emphasis on visual flow. "
            "MANDATORY: Use FadeIn, FadeOut, Transform, and other transition effects for EVERY element. "
            "Create a scene class named MainScene (or ThreeDScene when appropriate). "
            "Use MathTex for mathematical expressions. Include run_time parameters for all animations. "
            "CRITICAL: For graphs and areas, ALWAYS create graph object first: "
            "graph = axes.plot(lambda x: ...) then area = axes.get_area(graph, ...). "
            "NEVER pass lambda directly to get_area. "
            "Make animations visually stunning with smooth transitions between every scene change. "
            "Do not include any markdown, only pure Python code."
        )
        
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8000",
            "X-Title": "Manim Generator"
        }
        
        data = {
            "model": OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3,
            "max_tokens": 1500,
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
        logger.error(f"OpenRouter generation failed: {e}")
        return None


async def refine_code_with_openrouter(
    original_prompt: str,
    broken_code: str,
    error_message: str,
    error_type: str = "lint"
) -> Optional[str]:
    """Refine code using OpenRouter based on errors."""
    if not OPENROUTER_API_KEY:
        return None
    
    try:
        if error_type == "lint":
            sys_prompt = """You are a Python and Manim expert. Fix the following code's linting errors.
Maintain smooth transitions with FadeIn/FadeOut/Transform.
Ensure class MainScene exists and inherits from Scene.
Return ONLY corrected Python code."""
        else:
            sys_prompt = """You are a Manim expert. Fix the following code's rendering error.
Ensure all Manim objects and methods are valid.
Maintain smooth transitions. Return ONLY corrected Python code."""
        
        user_prompt = f"""Original Intent: {original_prompt}

{error_type.title()} Errors:
{error_message}

Broken Code:
{broken_code}"""
        
        headers = {
            "Authorization": f"Bearer {OPENROUTER_API_KEY}",
            "Content-Type": "application/json",
        }
        
        data = {
            "model": OPENROUTER_MODEL,
            "messages": [
                {"role": "system", "content": sys_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 1500,
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
            
    except Exception as e:
        logger.error(f"OpenRouter refinement failed: {e}")
        return None


async def generate_ai_manim_code(concept: str) -> Tuple[Optional[str], bool]:
    """
    Generate Manim code using OpenRouter with refinement and linting.
    
    Returns:
        Tuple of (code, used_ai)
    """
    # First, refine the prompt for better results
    refined_prompt = refine_prompt(concept)
    logger.info(f"Refined prompt: {refined_prompt}")
    
    # Generate code using OpenRouter
    code = await generate_openrouter_manim_code(refined_prompt)
    
    if not code and OPENROUTER_API_KEY:
        # Fallback to the old prompt generation if first attempt fails
        user_prompt = await generate_manim_prompt(concept)
        code = await generate_openrouter_manim_code(user_prompt)
    
    if code:
        logger.info("Code generated using OpenRouter")
        
        # Lint the code and attempt to fix if needed
        MAX_LINT_RETRIES = 2
        for attempt in range(MAX_LINT_RETRIES):
            lint_result = lint_code(code)
            if lint_result["success"]:
                logger.info(f"Code passed linting on attempt {attempt + 1}")
                break
            
            logger.info(f"Lint failed on attempt {attempt + 1}, attempting to fix...")
            
            # Try to fix with OpenRouter
            fixed_code = await refine_code_with_openrouter(
                refined_prompt, code, lint_result["errors"], "lint"
            )
            
            if fixed_code:
                code = fixed_code
            else:
                break
        
        return code, True
    
    return None, False