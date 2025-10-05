"""
Code linting service for validating generated Manim code.
"""

import subprocess
import os
from tempfile import NamedTemporaryFile
import logging
from tkinter import E

logger = logging.getLogger(__name__)


def lint_code(code: str) -> dict:
    """
    Lint Python code using ruff and return results.
    
    Args:
        code: Python code to lint
        
    Returns:
        Dictionary with success status and any errors found
    """
    temp_file = None
    try:
        # Write code to temporary file
        with NamedTemporaryFile(mode="w", suffix=".py", delete=False) as temp:
            temp.write(code)
            temp.flush()
            temp_file = temp.name
        
        # Run ruff linter
        result = subprocess.run(
            ["ruff", "check", temp_file], 
            capture_output=True, 
            text=True,
            timeout=10
        )
        
        # Check results
        if result.returncode == 0:
            return {"success": True, "errors": None}
        else:
            # Parse and return errors
            errors = result.stdout + result.stderr
            return {"success": False, "errors": errors.strip()}
            
    except subprocess.TimeoutExpired:
        return {"success": False, "errors": "Linting timeout - code may have infinite loops"}
    except FileNotFoundError:
        # Ruff not installed, try with pylint as fallback
        try:
            result = subprocess.run(
                ["pylint", "--errors-only", "--disable=all", "--enable=E", temp_file],
                capture_output=True,
                text=True,
                timeout=10
            )
            if "error" not in result.stdout.lower() and result.returncode == 0:
                return {"success": True, "errors": None}
            else:
                return {"success": False, "errors": result.stdout.strip()}
        except Exception as e:
            logger.warning("No linter available (ruff or pylint). Skipping lint check.")
            return {"success": True, "errors": None}  # Skip linting if no linter available
    except Exception as e:
        return {"success": False, "errors": f"Linting error: {str(e)}"}
    finally:
        # Clean up temp file
        if temp_file and os.path.exists(temp_file):
            try:
                os.unlink(temp_file)
            except OSError:
                pass