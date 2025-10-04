"use client";

import { useState } from "react";
import { useRAGUpload, useRAGQuery } from "@/lib/api/hooks";

interface RAGSource {
  content: string;
  page: number;
}

export function RAGPanel() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [indexName, setIndexName] = useState("pdf-index");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [streamingAnswer, setStreamingAnswer] = useState("");
  const [sources, setSources] = useState<RAGSource[]>([]);

  const upload = useRAGUpload();
  const ragQuery = useRAGQuery();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;

    upload.mutate(
      { file: selectedFile, indexName },
      {
        onSuccess: (data) => {
          alert(`✅ Uploaded: ${data.filename}\n${data.chunks} chunks indexed`);
          setSelectedFile(null);
        },
        onError: (error) => {
          alert(`❌ Upload failed: ${error.message}`);
        },
      }
    );
  };

  const handleQuery = async () => {
    if (!question.trim()) return;

    setAnswer("");
    setStreamingAnswer("");
    setSources([]);

    await ragQuery.query(question, {
      indexName,
      onChunk: (chunk) => {
        setStreamingAnswer((prev) => prev + chunk);
      },
      onComplete: (fullResponse, responseSources) => {
        setAnswer(fullResponse);
        setSources(responseSources || []);
        setStreamingAnswer("");
      },
      onError: (error) => {
        alert(`❌ Query failed: ${error.message}`);
      },
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 border-l p-4 space-y-4 overflow-y-auto">
      <h2 className="text-xl font-bold">📚 RAG (PDF Q&A)</h2>

      {/* Upload Section */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3">
        <h3 className="font-semibold">Upload PDF</h3>
        <input
          type="text"
          value={indexName}
          onChange={(e) => setIndexName(e.target.value)}
          placeholder="Index name"
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="w-full"
        />
        {selectedFile && (
          <div className="text-sm text-gray-600">
            Selected: {selectedFile.name}
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || upload.isPending}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {upload.isPending ? "Uploading..." : "Upload & Index"}
        </button>
        {upload.isSuccess && (
          <div className="text-sm text-green-600">✅ Upload successful!</div>
        )}
      </div>

      {/* Query Section */}
      <div className="bg-white p-4 rounded-lg shadow space-y-3 flex-1 flex flex-col">
        <h3 className="font-semibold">Ask Questions</h3>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a question about your PDF..."
          className="w-full px-3 py-2 border rounded resize-none"
          rows={3}
        />
        <button
          onClick={handleQuery}
          disabled={!question.trim() || ragQuery.isStreaming}
          className="w-full px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          {ragQuery.isStreaming ? "Searching..." : "Ask Question"}
        </button>

        {/* Answer Display */}
        {(answer || streamingAnswer) && (
          <div className="mt-4 space-y-2 flex-1 overflow-y-auto">
            <h4 className="font-semibold text-sm">Answer:</h4>
            <div className="p-3 bg-gray-100 rounded text-sm whitespace-pre-wrap">
              {streamingAnswer || answer}
            </div>

            {sources.length > 0 && (
              <div className="mt-3">
                <h4 className="font-semibold text-sm mb-2">
                  Sources ({sources.length}):
                </h4>
                <div className="space-y-2">
                  {sources.map((source, idx) => (
                    <div
                      key={idx}
                      className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs"
                    >
                      <div className="font-semibold mb-1">
                        Page {source.page}
                      </div>
                      <div className="text-gray-700">
                        {source.content.substring(0, 200)}...
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
