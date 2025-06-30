export interface Person {
  id: string;
  name: string;
  birthYear?: number;
  deathYear?: number;
  parentIds: string[];
  surnames: string[];
  birthPlace?: string;
  deathPlace?: string;
  marriagePlace?: string;
}

export interface TriangulationMatch {
  matchName: string;
  sourceFile: string;
  startPosition: number;
  endPosition: number;
  sizeCM: number;
  snps: number;
  yHaplogroup?: string;
  mtDNA?: string;
  surnames: string[];
}

export interface AncestryGraph {
  [personId: string]: {
    person: Person;
    ancestors: Person[];
  };
}

export interface MRCACandidate {
  person: Person;
  score: number;
  convergenceFactors: {
    cM: number;
    triangulationDepth: number;
    gedcomConvergence: number;
    surnameMatch: number;
    haplogroupConsistency: number;
    lifespanScore: number;
    locationScore: number;
  };
  explanations: string[];
  generationEstimate: number;
  matches: TriangulationMatch[];
}

export interface ACEWeights {
  cM: number;
  triangulationDepth: number;
  gedcomConvergence: number;
  surnameMatch: number;
  haplogroupConsistency: number;
  lifespanScore: number;
  locationScore: number;
}

export interface ACEResult {
  chromosome?: string;
  segment: string;
  matches: TriangulationMatch[];
  suggestedMRCA: MRCACandidate[];
  confidence: 'Low' | 'Medium' | 'High' | 'Very High';
}