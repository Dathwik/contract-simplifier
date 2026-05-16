// lib/types.ts
export type RiskLevel = "low" | "medium" | "high";

export interface Clause {
  title: string;
  original: string;
  simplified: string;
  risk: RiskLevel;
  riskReason: string | null;
}

export interface ContractAnalysis {
  summary: string;
  parties: string[];
  contractType: string;
  duration: string;
  clauses: Clause[];
  overallRisk: RiskLevel;
  missingProtections: string[];
  recommendation: string;
}