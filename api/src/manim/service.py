"""
Core Manim service for animation generation with multithreading support.
"""

import os
import subprocess
import logging
import shutil
from datetime import datetime
import random
from typing import Tuple
from pathlib import Path
import asyncio
from concurrent.futures import ThreadPoolExecutor
import threading

from .lint_service import lint_code
from .prompt_refiner import refine_prompt


logger = logging.getLogger(__name__)


class ManimService:
    """Service for generating Manim animations with multithreading support."""
    
    def __init__(self):
        """Initialize the Manim service with thread pool."""
        # Set up directories
        self.root_dir = Path(__file__).parent.parent.parent  # api directory
        self.static_dir = self.root_dir / "static"
        self.videos_dir = self.static_dir / "videos"
        self.temp_dir = self.root_dir / "tmp"
        self.media_dir = self.root_dir / "media"
        
        # Create required directories
        self._setup_directories()
        
        # Configure Manim defaults
        self.default_quality = os.getenv('RENDER_QUALITY', 'low').lower()
        
        # Initialize thread pool for concurrent video rendering
        # Default to 4 workers, configurable via environment variable
        max_workers = int(os.getenv('MANIM_MAX_WORKERS', '4'))
        self.executor = ThreadPoolExecutor(
            max_workers=max_workers,
            thread_name_prefix='manim-render'
        )
        
        # Track active renders for resource management
        self._active_renders = set()
        self._render_lock = threading.Lock()
        
        logger.info(f"Initialized ManimService with {max_workers} worker threads")
        
    def _setup_directories(self):
        """Create all required directories for the application."""
        directories = [
            self.static_dir,
            self.videos_dir,
            self.temp_dir,
            self.media_dir,
            self.media_dir / "videos",
            self.media_dir / "videos" / "scene",
            self.media_dir / "videos" / "scene" / "720p30",
            self.media_dir / "videos" / "scene" / "1080p60",
            self.media_dir / "videos" / "scene" / "480p15",
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            logger.info(f'Created/verified directory: {directory}')
    
    async def sanitize_input(self, text: str) -> str:
        """Sanitize input text by removing extra whitespace and newlines."""
        return ' '.join(text.strip().split())

    async def generate_manim_code(self, concept: str) -> Tuple[str, bool]:
        """
        Generate Manim code for the given concept with linting and refinement.
        
        Returns:
            Tuple of (code, used_ai)
        """
        concept = await self.sanitize_input(concept)
        
        # Generate code using AI with integrated linting and refinement
        from .ai_generator import generate_ai_manim_code
        code, used_ai = await generate_ai_manim_code(concept)
        
        if code:
            return code, used_ai
        
        return None, False

    def _run_manim_subprocess(
        self,
        command: list,
        cwd: str,
        timeout: int = 300
    ) -> subprocess.CompletedProcess:
        """
        Run manim subprocess in a thread-safe manner.
        
        Args:
            command: Command list to execute
            cwd: Working directory for the command
            timeout: Maximum execution time in seconds
            
        Returns:
            CompletedProcess result
        """
        return subprocess.run(
            command,
            capture_output=True,
            text=True,
            cwd=cwd,
            timeout=timeout
        )
    
    async def _render_in_thread(
        self,
        temp_dir: Path,
        code_file: Path,
        media_dir: Path,
        quality_flag: str,
        output_file: Path,
        filename: str
    ) -> Tuple[bool, dict]:
        """
        Execute manim rendering in a separate thread.
        
        Returns:
            Tuple of (success, result_dict)
        """
        command = [
            'manim',
            'render',
            quality_flag,
            '--format', 'mp4',
            '--media_dir', str(media_dir),
            str(code_file),
            'MainScene'
        ]
        
        # Run subprocess in thread pool
        loop = asyncio.get_event_loop()
        try:
            result = await loop.run_in_executor(
                self.executor,
                self._run_manim_subprocess,
                command,
                str(temp_dir),
                300  # 5 minute timeout
            )
            
            if result.returncode != 0:
                error_msg = result.stderr if result.stderr else 'Unknown error during animation generation'
                logger.error(f'Manim error for {filename}: {error_msg}')
                return False, {
                    'error': 'Failed to generate animation',
                    'details': error_msg
                }
            
            # Look for the video file
            return True, {'output_file': output_file}
            
        except subprocess.TimeoutExpired:
            logger.error(f'Timeout for {filename}')
            return False, {
                'error': 'Animation generation timed out',
                'details': 'The animation took too long to generate. Please try a simpler concept.'
            }
        except Exception as e:
            logger.error(f'Thread execution error for {filename}: {str(e)}')
            return False, {
                'error': 'Internal server error',
                'details': str(e)
            }
    
    async def render_animation(
        self,
        concept: str,
        quality: str = None,
    ) -> dict:
        """
        Generate and render a Manim animation using multithreading.
        
        Args:
            concept: Mathematical concept or LaTeX expression
            quality: Render quality (low, medium, high)
            
        Returns:
            Dictionary with success status, video URL, code, and other metadata
        """
        try:
            # Validate and set quality
            if quality not in {'low', 'medium', 'high', None}:
                quality = self.default_quality
            else:
                quality = quality or self.default_quality
            
            # Generate unique filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            random_str = ''.join(random.choices('abcdefghijklmnopqrstuvwxyz', k=6))
            filename = f'scene_{timestamp}_{random_str}'
            
            # Track this render
            with self._render_lock:
                self._active_renders.add(filename)
            
            # Create temporary directory for this generation
            temp_dir = self.temp_dir / filename
            temp_dir.mkdir(parents=True, exist_ok=True)
            
            try:
                # Generate Manim code
                manim_code, used_ai = await self.generate_manim_code(concept)
                
                if not manim_code:
                    return {
                        'success': False,
                        'error': 'Failed to generate code template',
                        'render_quality': quality
                    }
                
                # Write code to temporary file
                code_file = temp_dir / 'scene.py'
                code_file.write_text(manim_code)
                
                # Create media directory for this render
                media_dir = temp_dir / 'media'
                media_dir.mkdir(exist_ok=True)
                
                # Determine manim quality flag
                quality_flag = {'low': '-ql', 'medium': '-qm', 'high': '-qh'}[quality]
                
                # Prepare output file path
                output_file = self.videos_dir / f'{filename}.mp4'
                
                # Run rendering in thread pool
                success, render_result = await self._render_in_thread(
                    temp_dir,
                    code_file,
                    media_dir,
                    quality_flag,
                    output_file,
                    filename
                )
                
                if not success:
                    # Try to fix common errors if we used AI
                    if used_ai and 'details' in render_result:
                        error_msg = render_result['details']
                        logger.info(f"Error detected for {filename}: {error_msg[:200]}...")
                        
                        # First attempt: Try to fix common errors
                        fixed_code = await self.fix_common_manim_errors(manim_code, error_msg)
                        
                        if fixed_code != manim_code:
                            logger.info(f"Attempting to fix error for {filename} with pattern-based fixes")
                            
                            # Write fixed code
                            code_file.write_text(fixed_code)
                            
                            # Retry render with fixed code
                            success, render_result = await self._render_in_thread(
                                temp_dir,
                                code_file,
                                media_dir,
                                quality_flag,
                                output_file,
                                filename
                            )
                            
                            if success:
                                logger.info(f"Successfully fixed and rendered {filename}")
                                manim_code = fixed_code  # Update code for response
                            else:
                                logger.info(f"Pattern-based fix failed for {filename}, attempting AI-based fix")
                                
                                # Second attempt: Use AI to fix the specific error
                                from .ai_generator import refine_code_with_openrouter
                                from .prompt_refiner import refine_prompt
                                
                                refined_prompt = refine_prompt(concept)
                                ai_fixed_code = await refine_code_with_openrouter(
                                    refined_prompt,
                                    fixed_code,
                                    render_result.get('details', ''),
                                    "render"
                                )
                                
                                if ai_fixed_code and ai_fixed_code != fixed_code:
                                    logger.info(f"Attempting AI-based fix for {filename}")
                                    code_file.write_text(ai_fixed_code)
                                    
                                    success, render_result = await self._render_in_thread(
                                        temp_dir,
                                        code_file,
                                        media_dir,
                                        quality_flag,
                                        output_file,
                                        filename
                                    )
                                    
                                    if success:
                                        logger.info(f"Successfully fixed with AI and rendered {filename}")
                                        manim_code = ai_fixed_code
                                    else:
                                        logger.info(f"AI fix failed for {filename}, regenerating from scratch")
                                        
                                        # Third attempt: Regenerate entire code from scratch
                                        new_code, _ = await self.generate_manim_code(concept)
                                        
                                        if new_code:
                                            logger.info(f"Regenerated code from scratch for {filename}")
                                            code_file.write_text(new_code)
                                            
                                            success, render_result = await self._render_in_thread(
                                                temp_dir,
                                                code_file,
                                                media_dir,
                                                quality_flag,
                                                output_file,
                                                filename
                                            )
                                            
                                            if success:
                                                logger.info(f"Successfully rendered regenerated code for {filename}")
                                                manim_code = new_code
                                            else:
                                                logger.error(f"All recovery attempts failed for {filename}")
                                                return {
                                                    'success': False,
                                                    **render_result,
                                                    'render_quality': quality
                                                }
                                        else:
                                            logger.error(f"Failed to regenerate code for {filename}")
                                            return {
                                                'success': False,
                                                **render_result,
                                                'render_quality': quality
                                            }
                                else:
                                    logger.error(f"AI fix generation failed for {filename}")
                                    return {
                                        'success': False,
                                        **render_result,
                                        'render_quality': quality
                                    }
                        else:
                            # No pattern-based fix available, try AI fix directly
                            logger.info(f"No pattern fix available for {filename}, trying AI-based fix")
                            
                            from .ai_generator import refine_code_with_openrouter
                            from .prompt_refiner import refine_prompt
                            
                            refined_prompt = refine_prompt(concept)
                            ai_fixed_code = await refine_code_with_openrouter(
                                refined_prompt,
                                manim_code,
                                error_msg,
                                "render"
                            )
                            
                            if ai_fixed_code:
                                logger.info(f"Attempting AI-based fix for {filename}")
                                code_file.write_text(ai_fixed_code)
                                
                                success, render_result = await self._render_in_thread(
                                    temp_dir,
                                    code_file,
                                    media_dir,
                                    quality_flag,
                                    output_file,
                                    filename
                                )
                                
                                if success:
                                    logger.info(f"Successfully fixed with AI and rendered {filename}")
                                    manim_code = ai_fixed_code
                                else:
                                    logger.info(f"AI fix failed, regenerating from scratch for {filename}")
                                    
                                    # Regenerate entire code from scratch
                                    new_code, _ = await self.generate_manim_code(concept)
                                    
                                    if new_code:
                                        logger.info(f"Regenerated code from scratch for {filename}")
                                        code_file.write_text(new_code)
                                        
                                        success, render_result = await self._render_in_thread(
                                            temp_dir,
                                            code_file,
                                            media_dir,
                                            quality_flag,
                                            output_file,
                                            filename
                                        )
                                        
                                        if success:
                                            logger.info(f"Successfully rendered regenerated code for {filename}")
                                            manim_code = new_code
                                        else:
                                            logger.error(f"All recovery attempts failed for {filename}")
                                            return {
                                                'success': False,
                                                **render_result,
                                                'render_quality': quality
                                            }
                                    else:
                                        logger.error(f"Failed to regenerate code for {filename}")
                                        return {
                                            'success': False,
                                            **render_result,
                                            'render_quality': quality
                                        }
                            else:
                                logger.error(f"AI fix generation failed for {filename}")
                                return {
                                    'success': False,
                                    **render_result,
                                    'render_quality': quality
                                }
                    else:
                        # Not AI generated or no error details
                        return {
                            'success': False,
                            **render_result,
                            'render_quality': quality
                        }
                
                # Look for the video file in multiple possible locations
                possible_paths = [
                    media_dir / 'videos' / 'scene' / '1080p60' / 'MainScene.mp4',
                    media_dir / 'videos' / 'scene' / '720p30' / 'MainScene.mp4',
                    media_dir / 'videos' / 'scene' / '480p15' / 'MainScene.mp4',
                    media_dir / 'videos' / 'MainScene.mp4',
                    temp_dir / 'MainScene.mp4'
                ]
                
                video_found = False
                for source_path in possible_paths:
                    if source_path.exists():
                        shutil.move(str(source_path), str(output_file))
                        video_found = True
                        break
                
                # Fallback: walk media_dir recursively to locate the file
                if not video_found:
                    for root, _dirs, files in os.walk(media_dir):
                        if 'MainScene.mp4' in files:
                            try:
                                shutil.move(
                                    os.path.join(root, 'MainScene.mp4'),
                                    str(output_file)
                                )
                                video_found = True
                                break
                            except Exception as move_err:
                                logger.error(f'Error moving located video: {move_err}')
                                continue
                
                if not video_found:
                    logger.error('Video not found in any expected locations')
                    return {
                        'success': False,
                        'error': 'Generated video file not found',
                        'render_quality': quality
                    }
                
                # Return success response
                return {
                    'success': True,
                    'video_url': f'/manim/videos/{filename}.mp4',
                    'code': manim_code,
                    'used_ai': used_ai,
                    'render_quality': quality
                }
                
            finally:
                # Cleanup temporary directory
                shutil.rmtree(temp_dir, ignore_errors=True)
                
                # Remove from active renders
                with self._render_lock:
                    self._active_renders.discard(filename)
                
        except Exception as e:
            logger.error(f'Error generating animation: {str(e)}')
            
            # Remove from active renders
            with self._render_lock:
                self._active_renders.discard(filename)
            
            return {
                'success': False,
                'error': 'Internal server error',
                'details': str(e),
                'render_quality': quality
            }
    
    async def render_multiple_animations(
        self,
        concepts: list,
        quality: str = None
    ) -> list:
        """
        Render multiple animations concurrently.
        
        Args:
            concepts: List of mathematical concepts to render
            quality: Render quality for all animations
            
        Returns:
            List of results for each animation
        """
        # Create tasks for all concepts
        tasks = [
            self.render_animation(concept, quality)
            for concept in concepts
        ]
        
        # Execute all tasks concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Process results
        processed_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                processed_results.append({
                    'success': False,
                    'error': 'Failed to generate animation',
                    'details': str(result),
                    'concept': concepts[i]
                })
            else:
                result['concept'] = concepts[i]
                processed_results.append(result)
        
        return processed_results
    
    def get_active_renders_count(self) -> int:
        """Get the number of currently active renders."""
        with self._render_lock:
            return len(self._active_renders)
    
    def shutdown(self):
        """Gracefully shutdown the thread pool executor."""
        logger.info("Shutting down ManimService thread pool...")
        self.executor.shutdown(wait=True)
        logger.info("ManimService thread pool shutdown complete")
    
    async def fix_common_manim_errors(self, code: str, error_msg: str) -> str:
        """
        Fix common Manim code errors.
        
        Args:
            code: The Manim code with errors
            error_msg: The error message from Manim
            
        Returns:
            Fixed code or original code if no fix available
        """
        import re
        
        logger.info(f"Attempting to fix common Manim errors")
        
        # Fix get_area error where lambda is passed directly
        if "get_area" in error_msg and "'function' object has no attribute" in error_msg:
            # Pattern to find incorrect get_area usage
            pattern = r'(\w+)\.get_area\s*\(\s*lambda\s+(\w+)\s*:\s*([^,\)]+)'
            
            lines = code.split('\n')
            fixed_lines = []
            
            for i, line in enumerate(lines):
                if 'get_area' in line and 'lambda' in line:
                    # Extract indentation
                    indent = len(line) - len(line.lstrip())
                    indent_str = ' ' * indent
                    
                    # Try to parse the get_area call
                    if match := re.search(pattern, line):
                        axes_var = match.group(1)
                        lambda_var = match.group(2)
                        lambda_expr = match.group(3).strip()
                        
                        # Remove trailing comma or parenthesis from lambda_expr
                        lambda_expr = lambda_expr.rstrip(',)')
                        
                        # Add the graph creation line
                        graph_line = f"{indent_str}graph = {axes_var}.plot(lambda {lambda_var}: {lambda_expr})"
                        fixed_lines.append(graph_line)
                        
                        # Fix the get_area line
                        fixed_line = re.sub(
                            r'get_area\s*\(\s*lambda\s+\w+\s*:[^,\)]+',
                            'get_area(graph',
                            line
                        )
                        fixed_lines.append(fixed_line)
                    else:
                        fixed_lines.append(line)
                else:
                    fixed_lines.append(line)
            
            return '\n'.join(fixed_lines)
        
        # Fix get_riemann_rectangles error
        if "get_riemann_rectangles" in error_msg and "'function' object" in error_msg:
            lines = code.split('\n')
            fixed_lines = []
            
            for i, line in enumerate(lines):
                if 'get_riemann_rectangles' in line and 'lambda' in line:
                    # Extract indentation
                    indent = len(line) - len(line.lstrip())
                    indent_str = ' ' * indent
                    
                    # Find the axes variable and lambda
                    pattern = r'(\w+)\.get_riemann_rectangles\s*\(\s*lambda\s+(\w+)\s*:\s*([^,\)]+)'
                    if match := re.search(pattern, line):
                        axes_var = match.group(1)
                        lambda_var = match.group(2)
                        lambda_expr = match.group(3).strip().rstrip(',)')
                        
                        # Add graph creation
                        graph_line = f"{indent_str}graph = {axes_var}.plot(lambda {lambda_var}: {lambda_expr})"
                        fixed_lines.append(graph_line)
                        
                        # Fix the line
                        fixed_line = re.sub(
                            r'get_riemann_rectangles\s*\(\s*lambda\s+\w+\s*:[^,\)]+',
                            'get_riemann_rectangles(graph',
                            line
                        )
                        fixed_lines.append(fixed_line)
                    else:
                        fixed_lines.append(line)
                else:
                    fixed_lines.append(line)
            
            return '\n'.join(fixed_lines)
        
        # Fix missing numpy import
        if ("np." in error_msg or "numpy" in error_msg) and "NameError" in error_msg:
            logger.info("Fixing missing numpy import")
            lines = code.split('\n')
            
            # Check if numpy is already imported
            has_numpy = any('import numpy' in line or 'from numpy' in line for line in lines)
            
            if not has_numpy:
                # Add numpy import after manim import
                fixed_lines = []
                for line in lines:
                    fixed_lines.append(line)
                    if 'from manim import' in line or 'import manim' in line:
                        fixed_lines.append('import numpy as np')
                
                return '\n'.join(fixed_lines)
        
        # Fix incorrect color names
        if "color" in error_msg.lower() or "attribute" in error_msg:
            logger.info("Attempting to fix color-related errors")
            # Common color fixes
            color_fixes = {
                'GOLD': 'YELLOW',
                'GOLD_A': 'YELLOW',
                'GOLD_B': 'YELLOW',
                'GOLD_C': 'YELLOW',
                'GOLD_D': 'YELLOW',
                'GOLD_E': 'YELLOW',
                'TEAL': 'BLUE_C',
                'MAROON': 'RED_C',
                'PURPLE': 'PURPLE_C'
            }
            
            fixed_code = code
            for wrong_color, right_color in color_fixes.items():
                if wrong_color in fixed_code:
                    fixed_code = fixed_code.replace(wrong_color, right_color)
                    logger.info(f"Replaced {wrong_color} with {right_color}")
            
            if fixed_code != code:
                return fixed_code
        
        # Fix common attribute errors with Manim objects
        if "AttributeError" in error_msg:
            logger.info("Attempting to fix AttributeError")
            
            # Fix common method name mistakes
            method_fixes = [
                ('ShowCreation', 'Create'),
                ('ShowCreationThenDestruction', 'Create'),
                ('ShowCreationThenFadeOut', 'Create'),
                ('ShowIncreasingSubsets', 'Create'),
                ('ShowSubmobjectsOneByOne', 'Create'),
                ('FadeInFromDown', 'FadeIn'),
                ('FadeOutAndShift', 'FadeOut'),
                ('FadeInFromLarge', 'FadeIn'),
                ('GrowFromCenter', 'GrowFromPoint'),
            ]
            
            fixed_code = code
            for wrong_method, right_method in method_fixes:
                if wrong_method in fixed_code:
                    fixed_code = fixed_code.replace(wrong_method, right_method)
                    logger.info(f"Replaced {wrong_method} with {right_method}")
            
            if fixed_code != code:
                return fixed_code
        
        # Fix incorrect Scene class inheritance
        if "MainScene" in error_msg and "not defined" in error_msg:
            logger.info("Fixing missing MainScene class")
            if "class MainScene" not in code:
                # Try to find any Scene class and rename it
                fixed_code = re.sub(r'class \w+Scene\(Scene\)', 'class MainScene(Scene)', code)
                if fixed_code == code:
                    # No Scene class found, wrap the code in MainScene
                    lines = code.split('\n')
                    indented_lines = ['        ' + line if line.strip() else line for line in lines]
                    fixed_code = "from manim import *\n\nclass MainScene(Scene):\n    def construct(self):\n" + '\n'.join(indented_lines)
                return fixed_code
        
        # Fix Rectangle constructor errors
        if "Rectangle" in error_msg and ("bottom_left" in error_msg or "bottom_right" in error_msg or "unexpected keyword argument" in error_msg):
            logger.info("Fixing Rectangle constructor with incorrect parameters")
            
            # Pattern to find Rectangle with wrong parameters
            pattern = r'Rectangle\s*\([^)]*(?:bottom_left|bottom_right|top_left|top_right)[^)]*\)'
            
            lines = code.split('\n')
            fixed_lines = []
            
            for line in lines:
                if 'Rectangle(' in line and any(param in line for param in ['bottom_left', 'bottom_right', 'top_left', 'top_right']):
                    # Extract indentation
                    indent = len(line) - len(line.lstrip())
                    indent_str = ' ' * indent
                    
                    # Try to extract the intended dimensions or position
                    # For now, replace with a simple Rectangle
                    logger.info(f"Replacing incorrect Rectangle: {line.strip()}")
                    
                    # Check if there's color or fill_opacity
                    color_match = re.search(r'color\s*=\s*(\w+)', line)
                    opacity_match = re.search(r'fill_opacity\s*=\s*([\d.]+)', line)
                    
                    # Build new Rectangle call
                    new_rect = f"{indent_str}Rectangle("
                    params = []
                    params.append("width=1")
                    params.append("height=0.5")
                    
                    if color_match:
                        params.append(f"color={color_match.group(1)}")
                    if opacity_match:
                        params.append(f"fill_opacity={opacity_match.group(1)}")
                    
                    new_rect += ", ".join(params) + ")"
                    fixed_lines.append(new_rect)
                else:
                    fixed_lines.append(line)
            
            return '\n'.join(fixed_lines)
        
        # Fix Square constructor errors
        if "Square" in error_msg and "unexpected keyword argument" in error_msg:
            logger.info("Fixing Square constructor with incorrect parameters")
            
            lines = code.split('\n')
            fixed_lines = []
            
            for line in lines:
                if 'Square(' in line:
                    # Check for common wrong parameters
                    if any(param in line for param in ['width', 'height', 'radius']):
                        indent = len(line) - len(line.lstrip())
                        indent_str = ' ' * indent
                        
                        # Extract valid parameters
                        color_match = re.search(r'color\s*=\s*(\w+)', line)
                        opacity_match = re.search(r'fill_opacity\s*=\s*([\d.]+)', line)
                        side_match = re.search(r'side_length\s*=\s*([\d.]+)', line)
                        
                        new_square = f"{indent_str}Square("
                        params = []
                        
                        if side_match:
                            params.append(f"side_length={side_match.group(1)}")
                        if color_match:
                            params.append(f"color={color_match.group(1)}")
                        if opacity_match:
                            params.append(f"fill_opacity={opacity_match.group(1)}")
                        
                        new_square += ", ".join(params) if params else ""
                        new_square += ")"
                        fixed_lines.append(new_square)
                    else:
                        fixed_lines.append(line)
                else:
                    fixed_lines.append(line)
            
            if fixed_lines != lines:
                return '\n'.join(fixed_lines)
        
        return code