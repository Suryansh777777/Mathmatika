"""
Advanced prompt refinement for better Manim animation generation.
"""

import re
import logging

logger = logging.getLogger(__name__)

# Color mapping for consistency
COLOR_MAP = {
    "red": "#e07a5f",
    "blue": "#525893",
    "green": "#87c2a5",
    "black": "#343434",
    "white": "#ffffff",
    "yellow": "#f4d35e",
    "purple": "#9b5de5",
    "orange": "#f8961e",
    "brown": "#a0522d",
    "pink": "#ff69b4",
    "gray": "#808080",
    "grey": "#808080",
    "cyan": "#00ffff",
    "magenta": "#ff00ff"
}


def replace_named_colors_with_hex(prompt: str) -> str:
    """Replace named colors with hex values for consistency."""
    def color_replacer(match):
        color = match.group(1).lower()
        return COLOR_MAP.get(color, color)
    
    return re.sub(r'\b(' + '|'.join(COLOR_MAP.keys()) + r')\b', color_replacer, prompt, flags=re.IGNORECASE)


def is_transformation_request(prompt: str) -> bool:
    """Check if the prompt is requesting a transformation animation."""
    indicators = [
        "transform", "morph", "change into", "becomes", "turns into",
        "point to", "circle to", "square to", "convert", "→", "->", 
        "into a", "to a", "evolve", "transition"
    ]
    return any(indicator in prompt.lower() for indicator in indicators)


def extract_transformation_sequence(prompt: str) -> list:
    """Extract transformation sequence from the prompt."""
    prompt_lower = prompt.lower()
    
    # Define separators for transformations
    separators = [
        (r'\s+to\s+', ' to '),
        (r'\s*→\s*', '→'),
        (r'\s*->\s*', '->'),
        (r'\s+into\s+', ' into '),
        (r'\s+becomes\s+', ' becomes '),
        (r'\s+transforms?\s+to\s+', ' transforms to '),
        (r'\s+morphs?\s+to\s+', ' morphs to '),
        (r'\s+changes?\s+into\s+', ' changes into ')
    ]
    
    # Try to extract sequence
    for sep_pattern, sep_display in separators:
        parts = re.split(sep_pattern, prompt_lower)
        if len(parts) > 1:
            sequence = []
            for part in parts:
                # Clean and extract shape names
                cleaned = re.sub(r'\b(a|an|the|from|change|transform|morph)\b', '', part.strip())
                cleaned = re.sub(r'\b(transformation|into|to)\b.*', '', cleaned).strip()
                
                words = cleaned.split()
                if words:
                    for word in words:
                        if len(word) > 1 and word.isalpha():
                            sequence.append(word)
                            break
            
            if len(sequence) > 1:
                return sequence
    
    return []


def refine_prompt(prompt: str) -> str:
    """
    Refine user prompt for better Manim code generation.
    
    Args:
        prompt: Raw user prompt
        
    Returns:
        Refined prompt with specific Manim instructions
    """
    prompt = prompt.strip()
    if not prompt:
        return "Show a simple title that says 'Welcome to Manim' with smooth fade-in animation."
    
    # Replace colors with hex values
    prompt = replace_named_colors_with_hex(prompt)
    
    # Check for transformation requests
    if is_transformation_request(prompt):
        sequence = extract_transformation_sequence(prompt)
        
        if len(sequence) >= 4:
            steps = " → ".join(sequence)
            return (f"Create a complex animated transformation sequence: {steps}. "
                   f"Use Manim objects with smooth Transform animations, proper timing delays, "
                   f"and fade transitions between each step. Include color changes and scaling effects.")
        elif len(sequence) == 3:
            return (f"Create a smooth animated transformation sequence: {sequence[0]} transforms to "
                   f"{sequence[1]} which then transforms to {sequence[2]}. Use appropriate Manim shapes "
                   f"with Transform animations, FadeOut/FadeIn transitions, and smooth timing.")
        elif len(sequence) == 2:
            return (f"Create a smooth animated transformation: {sequence[0]} transforms into {sequence[1]}. "
                   f"Use appropriate Manim shapes with Transform animation, color transitions, "
                   f"and smooth FadeIn/FadeOut effects.")
    
    # Educational and mathematical rules
    educational_keywords = {
        "explain": "Create a step-by-step educational animation with clear visual progression and text explanations",
        "prove": "Create an animated mathematical proof with step-by-step derivations using MathTex and transitions",
        "solve": "Animate the solving process step-by-step showing each mathematical operation with transforms",
        "derive": "Show the mathematical derivation process with animated equation transformations",
        "demonstrate": "Provide an animated demonstration with clear visual examples and smooth transitions",
        "teach": "Create an educational animation that teaches the concept with visual aids and text",
        "illustrate": "Illustrate the concept with visual examples, diagrams, and smooth animations"
    }
    
    math_keywords = {
        "quadratic": "Animate quadratic functions with parabola graphing, vertex highlighting, and smooth transitions",
        "limit": "Visualize limits with animated approaching values and epsilon-delta visualization",
        "integration": "Show integration as area calculation with animated Riemann sums and smooth filling",
        "differentiation": "Animate derivatives as changing slopes with tangent lines and smooth transitions",
        "trigonometry": "Create animated trigonometric visualizations with unit circle and smooth wave animations",
        "vector": "Animate vector operations in 2D/3D space with arrow animations and transformations",
        "matrix": "Display matrix operations with animated transformations and element-wise operations",
        "equation": "Display and animate mathematical equation solving with step-by-step transforms",
        "function": "Plot mathematical function with animated axes, grid, and smooth curve drawing",
        "graph": "Create animated graph with coordinate system, gridlines, and smooth plotting"
    }
    
    shape_keywords = {
        "circle": "Draw an animated circle with smooth FadeIn, rotation, and color effects",
        "square": "Draw an animated square with transformations, scaling, and color transitions",
        "triangle": "Draw an animated triangle with smooth entry and geometric properties",
        "rectangle": "Draw an animated rectangle with dimension labels and transformations",
        "polygon": "Draw an animated polygon with smooth construction and angle highlights",
        "line": "Draw animated lines with smooth drawing effect and arrow endpoints",
        "arrow": "Draw animated arrows with emphasis effects and smooth movements"
    }
    
    # Check for specific keywords and enhance prompt
    prompt_lower = prompt.lower()
    
    for keyword, enhancement in educational_keywords.items():
        if keyword in prompt_lower:
            return f"{enhancement}. Based on user request: '{prompt}'. Use smooth FadeIn/FadeOut transitions throughout."
    
    for keyword, enhancement in math_keywords.items():
        if keyword in prompt_lower:
            return f"{enhancement}. Based on user request: '{prompt}'. Include smooth transitions and visual effects."
    
    for keyword, enhancement in shape_keywords.items():
        if keyword in prompt_lower:
            return f"{enhancement}. Based on user request: '{prompt}'. Use Transform and FadeIn/FadeOut effects."
    
    # Default enhancement
    return (f"Create an animated Manim scene that illustrates: '{prompt}'. "
           f"Use appropriate visual elements with smooth FadeIn/FadeOut transitions, "
           f"Transform animations for morphing, and proper timing with run_time parameters.")