import { ManimVisualizer } from "@/components/manim-visualizer";

export default function VisualizePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Mathematical Animations with Manim
        </h1>
        <ManimVisualizer />
      </div>
    </div>
  );
}