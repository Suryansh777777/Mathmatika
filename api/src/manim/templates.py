"""
Manim template functions for various mathematical concepts.
"""

import re
from typing import Optional


# LaTeX detection helpers
LATEX_COMMAND_HINTS = [
    r"\\frac", r"\\sum", r"\\int", r"\\sqrt", r"\\alpha", r"\\beta",
    r"\\pi", r"\\sin", r"\\cos", r"\\tan", r"\\left", r"\\right",
]


def is_likely_latex(text: str) -> bool:
    """Check if text is likely a LaTeX expression."""
    t = text.strip()
    if not t:
        return False
    if any(d in t for d in ["$$", "$", r"\\(", r"\\)", r"\\[", r"\\]"]):
        return True
    if any(cmd in t for cmd in LATEX_COMMAND_HINTS):
        return True
    if ("^" in t or "_" in t) and " " not in t.strip()[:3]:
        return True
    return False


def clean_latex(text: str) -> str:
    """Clean LaTeX expression by removing common delimiters."""
    t = text.strip()
    # remove common delimiters
    t = re.sub(r"^\$+|\$+$", "", t)
    t = re.sub(r"^\\\(|\\\)$", "", t)
    t = re.sub(r"^\\\[|\\\]$", "", t)
    return t.strip()


def generate_latex_scene_code(expr: str) -> str:
    """Generate Manim code for LaTeX expression."""
    expr = clean_latex(expr)
    return f"""from manim import *

class MainScene(Scene):
    def construct(self):
        title = Title('LaTeX Expression')
        eq = MathTex(r"{expr}").scale(1.2)
        self.play(Write(title))
        self.play(Write(eq))
        self.wait()
"""


# Template mapping
TEMPLATE_MAPPINGS = {
    'pythagorean': {
        'keywords': ['pythagoras', 'pythagorean', 'right triangle', 'hypotenuse'],
        'generator': 'generate_pythagorean_code'
    },
    'quadratic': {
        'keywords': ['quadratic', 'parabola', 'x squared', 'x^2'],
        'generator': 'generate_quadratic_code'
    },
    'trigonometry': {
        'keywords': ['sine', 'cosine', 'trigonometry', 'trig', 'unit circle'],
        'generator': 'generate_trig_code'
    },
    '3d_surface': {
        'keywords': ['3d surface', 'surface plot', '3d plot', 'three dimensional'],
        'generator': 'generate_3d_surface_code'
    },
    'sphere': {
        'keywords': ['sphere', 'ball', 'spherical'],
        'generator': 'generate_sphere_code'
    },
    'cube': {
        'keywords': ['cube', 'cubic', 'box'],
        'generator': 'generate_cube_code'
    },
    'derivative': {
        'keywords': ['derivative', 'differentiation', 'slope', 'rate of change'],
        'generator': 'generate_derivative_code'
    },
    'integral': {
        'keywords': ['integration', 'integral', 'area under curve', 'antiderivative'],
        'generator': 'generate_integral_code'
    },
    'matrix': {
        'keywords': ['matrix', 'matrices', 'linear transformation'],
        'generator': 'generate_matrix_code'
    },
    'eigenvalue': {
        'keywords': ['eigenvalue', 'eigenvector', 'characteristic'],
        'generator': 'generate_eigenvalue_code'
    },
    'complex': {
        'keywords': ['complex', 'imaginary', 'complex plane'],
        'generator': 'generate_complex_code'
    },
    'differential_equation': {
        'keywords': ['differential equation', 'ode', 'pde'],
        'generator': 'generate_diff_eq_code'
    }
}


def select_template(concept: str) -> Optional[str]:
    """Select appropriate template based on the concept."""
    concept = concept.lower().strip()
    
    # Find best matching template
    best_match = None
    max_matches = 0
    
    for template_name, template_info in TEMPLATE_MAPPINGS.items():
        matches = sum(1 for keyword in template_info['keywords'] if keyword in concept)
        if matches > max_matches:
            max_matches = matches
            best_match = template_info['generator']
    
    # Return best matching template or None
    if best_match and max_matches > 0:
        # Get the function by name
        generator_func = globals().get(best_match)
        if generator_func:
            return generator_func()
    
    return None


def generate_pythagorean_code():
    return '''from manim import *

class MainScene(Scene):
    def construct(self):
        # Create triangle
        triangle = Polygon(
            ORIGIN, RIGHT*3, UP*4,
            color=WHITE
        )
        
        # Add labels
        a_label = MathTex("a").next_to(triangle, DOWN)
        b_label = MathTex("b").next_to(triangle, RIGHT)
        c_label = MathTex("c").next_to(
            triangle.get_center() + UP + RIGHT,
            UP+RIGHT
        )
        
        # Add equation
        equation = MathTex(r"a^2 + b^2 = c^2").scale(1.1).to_edge(UP)
        
        # Create the animation
        self.play(Create(triangle))
        self.play(Write(a_label), Write(b_label), Write(c_label))
        self.play(Write(equation))
        self.wait()'''


def generate_derivative_code():
    return '''from manim import *

class MainScene(Scene):
    def construct(self):
        # Create coordinate system
        axes = Axes(
            x_range=[-2, 2],
            y_range=[-1, 2],
            axis_config={"include_tip": True}
        )
        
        # Add labels
        x_label = MathTex("x").next_to(axes.x_axis.get_end(), RIGHT)
        y_label = MathTex("y").next_to(axes.y_axis.get_end(), UP)
        
        # Create function
        def func(x):
            return x**2
            
        graph = axes.plot(func, color=BLUE)
        
        # Create derivative function
        def deriv(x):
            return 2*x
            
        derivative = axes.plot(deriv, color=RED)
        
        # Create labels
        func_label = MathTex("f(x) = x^2").set_color(BLUE).to_corner(UL)
        deriv_label = MathTex("f'(x) = 2x").set_color(RED).next_to(func_label, DOWN)
        
        # Create animations
        self.play(Create(axes), Write(x_label), Write(y_label))
        self.play(Create(graph), Write(func_label))
        self.wait()
        self.play(Create(derivative), Write(deriv_label))
        self.wait()'''


def generate_integral_code():
    return '''from manim import *

class MainScene(Scene):
    def construct(self):
        # Create coordinate system
        axes = Axes(
            x_range=[-2, 2],
            y_range=[-1, 2],
            axis_config={"include_tip": True}
        )
        
        # Add labels
        x_label = MathTex("x").next_to(axes.x_axis.get_end(), RIGHT)
        y_label = MathTex("y").next_to(axes.y_axis.get_end(), UP)
        
        # Create function
        def func(x):
            return x**2
            
        graph = axes.plot(func, color=BLUE)
        
        # Create area
        area = axes.get_area(
            graph,
            x_range=[0, 1],
            color=YELLOW,
            opacity=0.3
        )
        
        # Create labels
        func_label = MathTex("f(x) = x^2").set_color(BLUE).to_corner(UL)
        integral_label = MathTex(r"\\int_0^1 x^2 dx = \\frac{1}{3}").set_color(YELLOW).next_to(func_label, DOWN)
        
        # Create animations
        self.play(Create(axes), Write(x_label), Write(y_label))
        self.play(Create(graph), Write(func_label))
        self.wait()
        self.play(FadeIn(area), Write(integral_label))
        self.wait()'''


def generate_3d_surface_code():
    return '''from manim import *
import numpy as np

class MainScene(ThreeDScene):
    def construct(self):
        # Set up the axes
        axes = ThreeDAxes(
            x_range=[-3, 3, 1],
            y_range=[-3, 3, 1],
            z_range=[-2, 2, 0.5],
            x_length=6,
            y_length=6,
            z_length=4,
            axis_config={"include_tip": True}
        )
        
        # Create surface function
        def param_surface(u, v):
            x = u
            y = v
            z = np.sin(np.sqrt(x**2 + y**2))
            return np.array([x, y, z])
        
        # Create surface
        surface = Surface(
            lambda u, v: param_surface(u, v),
            u_range=[-3, 3],
            v_range=[-3, 3],
            resolution=(20, 20),
            should_make_jagged=False,
            stroke_opacity=0
        )
        
        # Add color
        surface.set_style(
            fill_opacity=0.8,
            stroke_color=BLUE,
            stroke_width=0.5,
            fill_color=BLUE
        )
        surface.set_fill_by_value(
            axes=axes,
            colors=[(RED, -0.5), (YELLOW, 0), (GREEN, 0.5)],
            axis=2
        )
        
        # Set up camera
        self.set_camera_orientation(
            phi=60 * DEGREES,
            theta=45 * DEGREES,
            zoom=0.6
        )
        
        # Animate
        self.begin_ambient_camera_rotation(rate=0.2)
        self.play(Create(axes))
        self.play(Create(surface))
        self.wait(2)
        self.stop_ambient_camera_rotation()
'''


def generate_sphere_code():
    return '''from manim import *
import numpy as np

class MainScene(ThreeDScene):
    def construct(self):
        # Set up the scene
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)
        axes = ThreeDAxes(
            x_range=[-3, 3],
            y_range=[-3, 3],
            z_range=[-3, 3],
            x_length=6,
            y_length=6,
            z_length=6
        )
        
        # Create sphere
        radius = 2
        sphere = Surface(
            lambda u, v: np.array([
                radius * np.cos(u) * np.cos(v),
                radius * np.cos(u) * np.sin(v),
                radius * np.sin(u)
            ]),
            u_range=[-PI/2, PI/2],
            v_range=[0, TAU],
            checkerboard_colors=[BLUE_D, BLUE_E],
            resolution=(15, 32)
        )
        
        # Create radius line and label
        radius_line = Line3D(
            start=ORIGIN,
            end=[radius, 0, 0],
            color=YELLOW
        )
        r_label = MathTex("r").set_color(YELLOW).rotate(PI/2, RIGHT).next_to(radius_line, UP)
        
        # Create volume formula
        volume_formula = MathTex(r"V = \\frac{4}{3}\\pi r^3").to_corner(UL)
        
        # Add everything to scene
        self.add(axes)
        self.play(Create(sphere))
        self.wait()
        self.play(Create(radius_line), Write(r_label))
        self.wait()
        self.play(Write(volume_formula))
        self.wait()
        
        # Rotate camera
        self.begin_ambient_camera_rotation(rate=0.2)
        self.wait(5)
        self.stop_ambient_camera_rotation()'''


def generate_cube_code():
    return '''from manim import *

class MainScene(ThreeDScene):
    def construct(self):
        # Set up the scene
        self.set_camera_orientation(phi=75 * DEGREES, theta=30 * DEGREES)
        axes = ThreeDAxes(
            x_range=[-3, 3],
            y_range=[-3, 3],
            z_range=[-3, 3]
        )
        
        # Create cube
        cube = Cube(side_length=2, fill_opacity=0.7, stroke_width=2)
        cube.set_color(BLUE)
        
        # Labels for sides
        a_label = MathTex("a").set_color(YELLOW).next_to(cube, RIGHT)
        
        # Surface area formula
        area_formula = MathTex("A = 6a^2").to_corner(UL)
        
        # Add everything to scene
        self.add(axes)
        self.play(Create(cube))
        self.wait()
        self.play(Write(a_label))
        self.wait()
        self.play(Write(area_formula))
        self.wait()
        
        # Rotate camera
        self.begin_ambient_camera_rotation(rate=0.2)
        self.wait(5)
        self.stop_ambient_camera_rotation()'''


def generate_matrix_code():
    return '''from manim import *

class MainScene(Scene):
    def construct(self):
        # Create matrices
        matrix_a = Matrix([
            [2, 1],
            [1, 3]
        ])
        
        matrix_b = Matrix([
            [1],
            [2]
        ])
        
        # Create result matrix
        result = Matrix([
            [4],
            [7]
        ])
        
        # Create equation
        equation = VGroup(
            matrix_a, MathTex("\\times"), matrix_b,
            MathTex("="), result
        ).arrange(RIGHT)
        
        # Create step-by-step calculations
        calc1 = MathTex("= \\begin{bmatrix} 2(1) + 1(2) \\\\ 1(1) + 3(2) \\end{bmatrix}")
        calc2 = MathTex("= \\begin{bmatrix} 2 + 2 \\\\ 1 + 6 \\end{bmatrix}")
        calc3 = MathTex("= \\begin{bmatrix} 4 \\\\ 7 \\end{bmatrix}")
        
        calcs = VGroup(calc1, calc2, calc3).arrange(DOWN).next_to(equation, DOWN, buff=1)
        
        # Create animations
        self.play(Create(matrix_a))
        self.play(Create(matrix_b))
        self.play(Write(equation[1]), Write(equation[3]))
        self.play(Create(result))
        self.wait()
        
        self.play(Write(calc1))
        self.play(Write(calc2))
        self.play(Write(calc3))
        self.wait()'''


def generate_eigenvalue_code():
    return '''from manim import *

class MainScene(Scene):
    def construct(self):
        # Create matrix and vector
        matrix = Matrix([
            [2, 1],
            [1, 2]
        ])
        
        vector = Matrix([
            ["v_1"],
            ["v_2"]
        ])
        
        # Create lambda and equation
        lambda_text = MathTex("\\lambda")
        equation = MathTex("Av = \\lambda v")
        
        # Position everything
        group = VGroup(matrix, vector, lambda_text, equation).arrange(RIGHT)
        group.to_edge(UP)
        
        # Create characteristic equation steps
        char_eq = MathTex("\\det(A - \\lambda I) = 0")
        expanded = MathTex("\\begin{vmatrix} 2-\\lambda & 1 \\\\ 1 & 2-\\lambda \\end{vmatrix} = 0")
        solved = MathTex("(2-\\lambda)^2 - 1 = 0")
        result = MathTex("\\lambda = 1, 3")
        
        # Position steps
        steps = VGroup(char_eq, expanded, solved, result).arrange(DOWN).next_to(group, DOWN, buff=1)
        
        # Create animations
        self.play(Create(matrix), Create(vector))
        self.play(Write(lambda_text), Write(equation))
        self.wait()
        
        self.play(Write(char_eq))
        self.play(Write(expanded))
        self.play(Write(solved))
        self.play(Write(result))
        self.wait()'''


def generate_complex_code():
    return '''from manim import *

class MainScene(Scene):
    def construct(self):
        # Set up plane
        plane = ComplexPlane()
        self.play(Create(plane))
        
        # Create complex number
        z = 3 + 2j
        dot = Dot([3, 2, 0], color=YELLOW)
        
        # Create vector and labels
        vector = Arrow(
            ORIGIN, dot.get_center(),
            buff=0, color=YELLOW
        )
        re_line = DashedLine(
            ORIGIN, [3, 0, 0], color=BLUE
        )
        im_line = DashedLine(
            [3, 0, 0], [3, 2, 0], color=RED
        )
        
        # Add labels
        z_label = MathTex("z = 3 + 2i").next_to(dot, UR)
        re_label = MathTex("\\text{Re}(z) = 3").next_to(re_line, DOWN)
        im_label = MathTex("\\text{Im}(z) = 2").next_to(im_line, RIGHT)
        
        # Animations
        self.play(Create(vector))
        self.play(Write(z_label))
        self.wait()
        self.play(Create(re_line), Create(im_line))
        self.play(Write(re_label), Write(im_label))
        self.wait()'''


def generate_diff_eq_code():
    return '''from manim import *
import numpy as np

class MainScene(Scene):
    def construct(self):
        # Create differential equation
        eq = MathTex(r"\\frac{dy}{dx} + 2y = e^x")
        
        # Solution steps
        step1 = MathTex(r"y = e^{-2x}\\int e^x \\cdot e^{2x} dx")
        step2 = MathTex(r"y = e^{-2x}\\int e^{3x} dx")
        step3 = MathTex(r"y = e^{-2x} \\cdot \\frac{1}{3}e^{3x} + Ce^{-2x}")
        step4 = MathTex(r"y = \\frac{1}{3}e^x + Ce^{-2x}")
        
        # Arrange equations
        VGroup(eq, step1, step2, step3, step4).arrange(DOWN, buff=0.5)
        
        # Create graph
        axes = Axes(
            x_range=[-2, 2],
            y_range=[-2, 2],
            axis_config={"include_tip": True}
        )
        
        # Plot particular solution (C=0)
        graph = axes.plot(
            lambda x: (1/3)*np.exp(x),
            color=YELLOW
        )
        
        # Animations
        self.play(Write(eq))
        self.wait()
        self.play(Write(step1))
        self.wait()
        self.play(Write(step2))
        self.wait()
        self.play(Write(step3))
        self.wait()
        self.play(Write(step4))
        self.wait()
        
        # Show graph
        self.play(FadeOut(VGroup(eq, step1, step2, step3, step4)))
        self.play(Create(axes), Create(graph))
        self.wait()'''


def generate_trig_code():
    return '''from manim import *

class MainScene(Scene):
    def construct(self):
        # Create coordinate plane
        plane = NumberPlane(
            x_range=[-4, 4],
            y_range=[-2, 2],
            axis_config={"include_tip": True}
        )
        
        # Add labels
        x_label = MathTex("x").next_to(plane.x_axis.get_end(), RIGHT)
        y_label = MathTex("y").next_to(plane.y_axis.get_end(), UP)
        
        # Create unit circle
        circle = Circle(radius=1, color=BLUE)
        
        # Create angle tracker
        theta = ValueTracker(0)
        
        # Create dot that moves around circle
        dot = always_redraw(
            lambda: Dot(
                circle.point_at_angle(theta.get_value()),
                color=YELLOW
            )
        )
        
        # Create lines to show sine and cosine
        x_line = always_redraw(
            lambda: Line(
                start=[circle.point_at_angle(theta.get_value())[0], 0, 0],
                end=circle.point_at_angle(theta.get_value()),
                color=GREEN
            )
        )
        
        y_line = always_redraw(
            lambda: Line(
                start=[0, 0, 0],
                end=[circle.point_at_angle(theta.get_value())[0], 0, 0],
                color=RED
            )
        )
        
        # Create labels
        sin_label = MathTex("\\sin(\\theta)").next_to(x_line).set_color(GREEN)
        cos_label = MathTex("\\cos(\\theta)").next_to(y_line).set_color(RED)
        
        # Add everything to scene
        self.play(Create(plane), Write(x_label), Write(y_label))
        self.play(Create(circle))
        self.play(Create(dot))
        self.play(Create(x_line), Create(y_line))
        self.play(Write(sin_label), Write(cos_label))
        
        # Animate angle
        self.play(
            theta.animate.set_value(2*PI),
            run_time=4,
            rate_func=linear
        )
        self.wait()'''


def generate_quadratic_code():
    return '''from manim import *

class MainScene(Scene):
    def construct(self):
        # Create coordinate system
        axes = Axes(
            x_range=[-4, 4],
            y_range=[-2, 8],
            axis_config={"include_tip": True}
        )
        
        # Add labels
        x_label = MathTex("x").next_to(axes.x_axis.get_end(), RIGHT)
        y_label = MathTex("y").next_to(axes.y_axis.get_end(), UP)
        
        # Create quadratic function
        def func(x):
            return x**2
            
        graph = axes.plot(
            func,
            color=BLUE,
            x_range=[-3, 3]
        )
        
        # Create labels and equation
        equation = MathTex("f(x) = x^2").to_corner(UL)
        
        # Create dot and value tracker
        x = ValueTracker(-3)
        dot = always_redraw(
            lambda: Dot(
                axes.c2p(
                    x.get_value(),
                    func(x.get_value())
                ),
                color=YELLOW
            )
        )
        
        # Create lines to show x and y values
        v_line = always_redraw(
            lambda: axes.get_vertical_line(
                axes.input_to_graph_point(
                    x.get_value(),
                    graph
                ),
                color=RED
            )
        )
        h_line = always_redraw(
            lambda: axes.get_horizontal_line(
                axes.input_to_graph_point(
                    x.get_value(),
                    graph
                ),
                color=GREEN
            )
        )
        
        # Add everything to scene
        self.play(Create(axes), Write(x_label), Write(y_label))
        self.play(Create(graph))
        self.play(Write(equation))
        self.play(Create(dot), Create(v_line), Create(h_line))
        
        # Animate x value
        self.play(
            x.animate.set_value(3),
            run_time=6,
            rate_func=there_and_back
        )
        self.wait()'''


def generate_basic_visualization_code():
    """Generate code for basic visualization."""
    return '''from manim import *
import numpy as np

class MainScene(Scene):
    def construct(self):
        # Create title
        title = Text("Mathematical Visualization", font_size=36).to_edge(UP)
        
        # Create axes
        axes = Axes(
            x_range=[-5, 5, 1],
            y_range=[-3, 3, 1],
            axis_config={"include_tip": True},
            x_length=10,
            y_length=6
        )
        
        # Add labels
        x_label = MathTex("x").next_to(axes.x_axis.get_end(), RIGHT)
        y_label = MathTex("y").next_to(axes.y_axis.get_end(), UP)
        
        # Create function graphs
        sin_graph = axes.plot(lambda x: np.sin(x), color=BLUE)
        cos_graph = axes.plot(lambda x: np.cos(x), color=RED)
        
        # Create labels for functions
        sin_label = MathTex("\\sin(x)").set_color(BLUE).next_to(sin_graph, UP)
        cos_label = MathTex("\\cos(x)").set_color(RED).next_to(cos_graph, DOWN)
        
        # Create dot to track movement
        moving_dot = Dot(color=YELLOW)
        moving_dot.move_to(axes.c2p(-5, 0))
        
        # Create path for dot to follow
        path = VMobject()
        path.set_points_smoothly([
            axes.c2p(x, np.sin(x)) 
            for x in np.linspace(-5, 5, 100)
        ])
        
        # Animate everything
        self.play(Write(title))
        self.play(Create(axes), Write(x_label), Write(y_label))
        self.play(Create(sin_graph), Write(sin_label))
        self.play(Create(cos_graph), Write(cos_label))
        self.play(Create(moving_dot))
        
        # Animate dot following the sine curve
        self.play(
            MoveAlongPath(moving_dot, path),
            run_time=3,
            rate_func=linear
        )
        
        # Final pause
        self.wait()
'''


def get_available_templates():
    """Get information about available templates."""
    templates = []
    for name, info in TEMPLATE_MAPPINGS.items():
        templates.append({
            "name": name,
            "keywords": info["keywords"],
            "description": f"Visualizes {name.replace('_', ' ')} concepts"
        })
    return templates