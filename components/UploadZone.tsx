// components/UploadZone.tsx
"use client";

import { useRef, useState } from "react";

interface Props {
  onFile: (file: File) => void;
  loading: boolean;
}

export default function UploadZone({ onFile, loading }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    const allowed = ["application/pdf", "text/plain"];
    if (!allowed.includes(file.type)) {
      alert("Please upload a PDF or .txt file.");
      return;
    }
    onFile(file);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => !loading && inputRef.current?.click()}
      className={`
        border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-200
        ${dragging
          ? "border-stone-400 bg-stone-100"
          : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-stone-100"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <div className="text-4xl mb-4">📄</div>
      <p className="text-stone-700 font-medium text-lg mb-1">
        {loading ? "Analyzing..." : "Drop your contract here"}
      </p>
      <p className="text-stone-400 text-sm">PDF or .txt · Click to browse</p>
    </div>
  );
}