"use client";

import { useState } from "react";
import {
  useResearch,
  useDeepResearch,
  useMultiAgentResearch,
} from "@/lib/api/hooks";

export default function Home() {
  const [query, setQuery] = useState("");

  const research = useResearch();
  const deepResearch = useDeepResearch();
  const multiAgentResearch = useMultiAgentResearch();

  const handleResearch = () => {
    if (!query.trim()) return;
    research.mutate({ query });
  };

  const handleDeepResearch = () => {
    if (!query.trim()) return;
    deepResearch.mutate({ query });
  };

  const handleMultiAgentResearch = () => {
    if (!query.trim()) return;
    multiAgentResearch.mutate({ query });
  };

  return (
    <div className="font-sans min-h-screen p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Mathematiks</h1>
        <p className="text-gray-600 dark:text-gray-400">
          AI-Powered Research Assistant
        </p>
      </header>

      <main className="space-y-6">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="query" className="block text-sm font-medium mb-2">
              Research Query
            </label>
            <input
              id="query"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleResearch();
              }}
              placeholder="Enter your research question..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleResearch}
              disabled={!query.trim() || research.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {research.isPending ? "Researching..." : "Basic Research"}
            </button>

            <button
              onClick={handleDeepResearch}
              disabled={!query.trim() || deepResearch.isPending}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {deepResearch.isPending ? "Researching..." : "Deep Research"}
            </button>

            <button
              onClick={handleMultiAgentResearch}
              disabled={!query.trim() || multiAgentResearch.isPending}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {multiAgentResearch.isPending
                ? "Researching..."
                : "Multi-Agent Research"}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Basic Research Result */}
          {(research.data || research.error) && (
            <div className="border border-blue-500 rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
              <h2 className="text-lg font-semibold mb-2 text-blue-900 dark:text-blue-100">
                Basic Research
              </h2>
              {research.error && (
                <p className="text-red-600 dark:text-red-400">
                  Error: {research.error.message}
                </p>
              )}
              {research.data && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sources: {research.data.sources}
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {research.data.response}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Deep Research Result */}
          {(deepResearch.data || deepResearch.error) && (
            <div className="border border-purple-500 rounded-lg p-4 bg-purple-50 dark:bg-purple-950">
              <h2 className="text-lg font-semibold mb-2 text-purple-900 dark:text-purple-100">
                Deep Research
              </h2>
              {deepResearch.error && (
                <p className="text-red-600 dark:text-red-400">
                  Error: {deepResearch.error.message}
                </p>
              )}
              {deepResearch.data && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sources: {deepResearch.data.sources}
                  </p>
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {deepResearch.data.response}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Multi-Agent Research Result */}
          {(multiAgentResearch.data || multiAgentResearch.error) && (
            <div className="border border-green-500 rounded-lg p-4 bg-green-50 dark:bg-green-950">
              <h2 className="text-lg font-semibold mb-2 text-green-900 dark:text-green-100">
                Multi-Agent Research
              </h2>
              {multiAgentResearch.error && (
                <p className="text-red-600 dark:text-red-400">
                  Error: {multiAgentResearch.error.message}
                </p>
              )}
              {multiAgentResearch.data && (
                <div className="space-y-2">
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Subagents: {multiAgentResearch.data.subagents}</span>
                    <span>
                      Total Sources: {multiAgentResearch.data.total_sources}
                    </span>
                  </div>
                  <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {multiAgentResearch.data.synthesis}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
