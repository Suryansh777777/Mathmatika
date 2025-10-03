"use client";

import { useState } from "react";
import { useManimGenerate } from "@/lib/api/hooks/manim";

export function ManimVisualizer() {
  const [concept, setConcept] = useState("");
  const [quality, setQuality] = useState<"low" | "medium" | "high">("low");
  const [useAI, setUseAI] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [showCode, setShowCode] = useState(false);

  const generateMutation = useManimGenerate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concept.trim()) return;

    generateMutation.mutate(
      {
        concept: concept.trim(),
        quality,
        use_ai: useAI,
      },
      {
        onSuccess: (data) => {
          if (data.success && data.video_url) {
            // Construct full URL for the video
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
            setVideoUrl(`${baseUrl}${data.video_url}`);
            setGeneratedCode(data.code || null);
          }
        },
      }
    );
  };

  const exampleConcepts = [
    "pythagorean theorem",
    "derivative of x²",
    "\\frac{d}{dx}(x^2) = 2x",
    "3D surface plot",
    "matrix multiplication",
    "sine and cosine waves",
    "integral of x²",
    "complex numbers",
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Manim Mathematical Visualizer</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="concept" className="block text-sm font-medium text-gray-700 mb-2">
              Mathematical Concept or LaTeX Expression
            </label>
            <input
              id="concept"
              type="text"
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              placeholder="e.g., pythagorean theorem, \\frac{d}{dx}(x^2)"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={generateMutation.isPending}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quality" className="block text-sm font-medium text-gray-700 mb-2">
                Render Quality
              </label>
              <select
                id="quality"
                value={quality}
                onChange={(e) => setQuality(e.target.value as "low" | "medium" | "high")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                disabled={generateMutation.isPending}
              >
                <option value="low">Low (Fast)</option>
                <option value="medium">Medium</option>
                <option value="high">High (Slow)</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="use-ai"
                type="checkbox"
                checked={useAI}
                onChange={(e) => setUseAI(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={generateMutation.isPending}
              />
              <label htmlFor="use-ai" className="ml-2 block text-sm text-gray-700">
                Use AI generation if no template matches
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={generateMutation.isPending || !concept.trim()}
            className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {generateMutation.isPending ? "Generating Animation..." : "Generate Animation"}
          </button>
        </form>

        {/* Example concepts */}
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {exampleConcepts.map((example) => (
              <button
                key={example}
                onClick={() => setConcept(example)}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                disabled={generateMutation.isPending}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error display */}
      {generateMutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error generating animation</p>
          <p className="text-red-600 text-sm mt-1">
            {generateMutation.error?.message || "An unexpected error occurred"}
          </p>
        </div>
      )}

      {/* Video display */}
      {videoUrl && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Generated Animation</h3>
            {generatedCode && (
              <button
                onClick={() => setShowCode(!showCode)}
                className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                {showCode ? "Hide Code" : "Show Code"}
              </button>
            )}
          </div>
          
          <div className="bg-black rounded-lg overflow-hidden">
            <video
              key={videoUrl}
              controls
              autoPlay
              loop
              className="w-full"
              style={{ maxHeight: "600px" }}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          {/* Code display */}
          {showCode && generatedCode && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Generated Manim Code:</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm">{generatedCode}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Generation info */}
      {generateMutation.data && generateMutation.data.success && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            <span className="font-medium">Generation Info:</span>
            {" "}Quality: {generateMutation.data.render_quality}
            {generateMutation.data.used_ai && " • Used AI generation"}
          </p>
        </div>
      )}
    </div>
  );
}