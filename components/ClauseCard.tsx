// components/ClauseCard.tsx
"use client";

import { useState } from "react";
import { Clause } from "@/lib/types";
import RiskBadge from "./RiskBadge";

export default function ClauseCard({ clause }: { clause: Clause }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden bg-white">

      {/* Header row — always visible, clicking toggles the card */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="font-medium text-stone-800">{clause.title}</span>
          <RiskBadge level={clause.risk} />
        </div>
        <span className="text-stone-400 text-sm">{open ? "▲" : "▼"}</span>
      </button>

      {/* Expanded body — only visible when open is true */}
      {open && (
        <div className="border-t border-stone-100 grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-100">

          {/* Left side — original legal text */}
          <div className="p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
              Original
            </div>
            <p className="text-sm text-stone-500 font-mono leading-relaxed">
              {clause.original}
            </p>
          </div>

          {/* Right side — plain English */}
          <div className="p-4">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-500 mb-2">
              Plain English
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              {clause.simplified}
            </p>
            {clause.riskReason && (
              <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                ⚠ {clause.riskReason}
              </p>
            )}
          </div>

        </div>
      )}

    </div>
  );
}