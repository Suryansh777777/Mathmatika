"""
Core Manim service for animation generation.
"""

import os
import subprocess
import logging
import shutil
from datetime import datetime
import random
from typing import Tuple
from pathlib import Path

from .templates import (
    is_likely_latex,
    generate_latex_scene_code,
    select_template,
    generate_basic_visualization_code
)
from .ai_generator import generate_ai_manim_code


logger = logging.getLogger(__name__)


class ManimService:
    """Service for generating Manim animations."""
    
    def __init__(self):
        """Initialize the Manim service."""
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

    async def generate_manim_code(self, concept: str, use_ai: bool = True) -> Tuple[str, bool]:
        """
        Generate Manim code for the given concept.
        
        Returns:
            Tuple of (code, used_ai)
        """
        concept = await self.sanitize_input(concept)
        used_ai = False
        
        # Check if this is a LaTeX expression
        if await is_likely_latex(concept):
            return await generate_latex_scene_code(concept), False
        
        # Try to match with a template first
        template_code = await select_template(concept.lower())
        if template_code:
            return template_code, False
        
        # Try AI generation if enabled and templates fail
        if use_ai:
            ai_code = await generate_ai_manim_code(concept)
            if ai_code:
                return ai_code, True
        
        # Fallback to basic visualization
        return await generate_basic_visualization_code(), False

    async def render_animation(
        self,
        concept: str,
        quality: str = None,
        use_ai: bool = True
    ) -> dict:
        """
        Generate and render a Manim animation.
        
        Args:
            concept: Mathematical concept or LaTeX expression
            quality: Render quality (low, medium, high)
            use_ai: Whether to use AI generation if no template matches
            
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
            
            # Create temporary directory for this generation
            temp_dir = self.temp_dir / filename
            temp_dir.mkdir(parents=True, exist_ok=True)
            
            try:
                # Generate Manim code
                manim_code, used_ai = await self.generate_manim_code(concept, use_ai)
                
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
                
                # Run manim command
                output_file = self.videos_dir / f'{filename}.mp4'
                command = [
                    'manim',
                    'render',
                    quality_flag,
                    '--format', 'mp4',
                    '--media_dir', str(media_dir),
                    str(code_file),
                    'MainScene'
                ]
                
                result = subprocess.run(
                    command,
                    capture_output=True,
                    text=True,
                    cwd=str(temp_dir),
                    timeout=300  # 5 minute timeout
                )
                
                if result.returncode != 0:
                    error_msg = result.stderr if result.stderr else 'Unknown error during animation generation'
                    logger.error(f'Manim error: {error_msg}')
                    return {
                        'success': False,
                        'error': 'Failed to generate animation',
                        'details': error_msg,
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
                
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Animation generation timed out',
                'details': 'The animation took too long to generate. Please try a simpler concept.',
                'render_quality': quality
            }
        except Exception as e:
            logger.error(f'Error generating animation: {str(e)}')
            return {
                'success': False,
                'error': 'Internal server error',
                'details': str(e),
                'render_quality': quality
            }