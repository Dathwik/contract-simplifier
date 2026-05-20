// app/page.tsx
"use client";

import { useState } from "react";
import { extractPdfText } from "@/lib/extractPdfText";
import { ContractAnalysis } from "@/lib/types";
import UploadZone from "@/components/UploadZone";
import ResultsPanel from "@/components/ResultsPanel";

export default function Home() {
  const [result, setResult]     = useState<ContractAnalysis | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [progress, setProgress] = useState("");

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Step 1 — Extract text from the PDF in the browser
      setProgress("Extracting text from PDF…");
      const text = file.type === "application/pdf"
        ? await extractPdfText(file)
        : await file.text();

      if (text.trim().length < 100) {
        throw new Error("Could not extract enough text from this file.");
      }

      // Step 2 — Send to your API route and stream Claude's response
      setProgress("Analyzing with Claude…");
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contractText: text }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      // Step 3 — Collect the streamed tokens into one string
      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }

      // Step 4 — Parse the JSON and store the result
      const clean = accumulated.replace(/```json|```/g, "").trim();
      const parsed: ContractAnalysis = JSON.parse(clean);
      setResult(parsed);

    } catch (e: any) {
      setError("Analysis failed: " + (e.message ?? "Unknown error"));
    } finally {
      setLoading(false);
      setProgress("");
    }
  }

  return (
    <main className="min-h-screen bg-stone-50">

      {/* Navigation bar */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-stone-200 px-8 py-4 flex items-center justify-between">
        <span className="font-bold text-stone-900 text-lg">⚖ ContractClear</span>
        <span className="text-xs text-stone-400 font-mono">Powered by Claude</span>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Hero — only shows before any result */}
        {!result && !loading && (
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-stone-900 mb-3 tracking-tight">
              Understand any contract<br />in plain English
            </h1>
            <p className="text-stone-500 text-lg">
              Upload a PDF. Get a risk analysis, key clauses explained, and a clear recommendation.
            </p>
          </div>
        )}

        {/* Upload zone — hides once results are shown */}
        {!result && (
          <UploadZone onFile={handleFile} loading={loading} />
        )}

        {/* Loading spinner */}
        {loading && (
          <div className="text-center py-24">
            <div className="inline-block w-8 h-8 border-2 border-stone-200 border-t-stone-600 rounded-full animate-spin mb-4" />
            <p className="text-stone-500 text-sm font-mono">{progress}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <ResultsPanel data={result} onReset={() => setResult(null)} />
        )}

      </div>
    </main>
  );
} 