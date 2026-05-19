// components/ResultsPanel.tsx
import { ContractAnalysis } from "@/lib/types";
import ClauseCard from "./ClauseCard";
import RiskBadge from "./RiskBadge";

interface Props {
  data: ContractAnalysis;
  onReset: () => void;
}

export default function ResultsPanel({ data, onReset }: Props) {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Header — contract type, risk badge, parties, reset button */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-2xl font-bold text-stone-900">{data.contractType}</h2>
            <RiskBadge level={data.overallRisk} />
          </div>
          <p className="text-stone-500 text-sm">{data.parties.join(" ↔ ")} · {data.duration}</p>
        </div>
        <button
          onClick={onReset}
          className="text-sm text-stone-400 hover:text-stone-700 transition-colors"
        >
          ← Analyze another
        </button>
      </div>

      {/* Plain English Summary */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6">
        <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
          Plain-English Summary
        </div>
        <p className="text-stone-700 leading-relaxed">{data.summary}</p>
      </div>

      {/* Recommendation */}
      {data.recommendation && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">
            Recommendation
          </div>
          <p className="text-stone-800 text-sm leading-relaxed">{data.recommendation}</p>
        </div>
      )}

      {/* Clauses */}
      <div>
        <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
          Key Clauses ({data.clauses.length})
        </div>
        <div className="space-y-2">
          {data.clauses.map((clause, index) => (
            <ClauseCard key={index} clause={clause} />
          ))}
        </div>
      </div>

      {/* Missing Protections */}
      {data.missingProtections?.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
          <div className="text-xs font-bold uppercase tracking-widest text-red-500 mb-3">
            Missing Protections
          </div>
          <ul className="space-y-2">
            {data.missingProtections.map((item, index) => (
              <li key={index} className="text-sm text-red-800 flex gap-2">
                <span>⚠</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}