import { Person, TriangulationMatch, AncestryGraph, MRCACandidate, ACEWeights, ACEResult } from '../types/genealogy';

export class ACEAlgorithm {
  private weights: ACEWeights = {
    cM: 0.3,
    gedcomConvergence: 0.25,
    lifespanScore: 0.15,
    locationScore: 0.15,
    triangulationDepth: 0.1,
    surnameMatch: 0.05,
    haplogroupConsistency: 0.05
  };

  analyzeTriangulation(matches: TriangulationMatch[], ancestryGraph: AncestryGraph): ACEResult[] {
    // Group matches by proximity (simplified - in real implementation would use more sophisticated clustering)
    const matchGroups = this.groupMatches(matches);
    const results: ACEResult[] = [];

    matchGroups.forEach(group => {
      const candidates = this.findMRCACandidates(group, ancestryGraph);
      const topCandidates = candidates.slice(0, 3); // Top 3 candidates

      results.push({
        segment: this.getSegmentDescription(group),
        matches: group,
        suggestedMRCA: topCandidates,
        confidence: this.calculateConfidence(topCandidates)
      });
    });

    return results;
  }

  private groupMatches(matches: TriangulationMatch[]): TriangulationMatch[][] {
    // Simple grouping by overlapping segments
    const groups: TriangulationMatch[][] = [];
    const used = new Set<number>();

    matches.forEach((match, index) => {
      if (used.has(index)) return;

      const group = [match];
      used.add(index);

      // Find overlapping matches
      matches.forEach((otherMatch, otherIndex) => {
        if (used.has(otherIndex)) return;

        if (this.segmentsOverlap(match, otherMatch)) {
          group.push(otherMatch);
          used.add(otherIndex);
        }
      });

      groups.push(group);
    });

    return groups;
  }

  private segmentsOverlap(match1: TriangulationMatch, match2: TriangulationMatch): boolean {
    return !(match1.endPosition < match2.startPosition || match2.endPosition < match1.startPosition);
  }

  private findMRCACandidates(matches: TriangulationMatch[], ancestryGraph: AncestryGraph): MRCACandidate[] {
    const candidateMap = new Map<string, MRCACandidate>();
    const matchedPersons = this.findMatchedPersons(matches, ancestryGraph);

    // For each matched person, examine their ancestors
    matchedPersons.forEach(({ match, person }) => {
      if (!person) return;

      const ancestors = ancestryGraph[person.id]?.ancestors || [];
      
      ancestors.forEach(ancestor => {
        const key = ancestor.id;
        
        if (!candidateMap.has(key)) {
          candidateMap.set(key, {
            person: ancestor,
            score: 0,
            convergenceFactors: {
              cM: 0,
              triangulationDepth: 0,
              gedcomConvergence: 0,
              surnameMatch: 0,
              haplogroupConsistency: 0,
              lifespanScore: 0,
              locationScore: 0
            },
            explanations: [],
            generationEstimate: 0,
            matches: []
          });
        }

        const candidate = candidateMap.get(key)!;
        candidate.matches.push(match);
      });
    });

    // Score each candidate
    candidateMap.forEach((candidate, key) => {
      this.scoreCandidate(candidate, matches, matchedPersons);
    });

    // Sort by score and return top candidates
    return Array.from(candidateMap.values())
      .sort((a, b) => b.score - a.score)
      .filter(c => c.score > 20); // Minimum threshold
  }

  private findMatchedPersons(matches: TriangulationMatch[], ancestryGraph: AncestryGraph): Array<{ match: TriangulationMatch; person: Person | null }> {
    return matches.map(match => ({
      match,
      person: this.findPersonByName(match.matchName, ancestryGraph)
    }));
  }

  private findPersonByName(name: string, ancestryGraph: AncestryGraph): Person | null {
    const canonicalName = this.canonicalizeName(name);
    
    for (const entry of Object.values(ancestryGraph)) {
      const personCanonical = this.canonicalizeName(entry.person.name);
      if (this.namesMatch(canonicalName, personCanonical)) {
        return entry.person;
      }
    }
    
    return null;
  }

  private canonicalizeName(name: string): string {
    return name.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private namesMatch(name1: string, name2: string): boolean {
    const words1 = name1.split(' ');
    const words2 = name2.split(' ');
    
    // Check for substantial overlap
    const commonWords = words1.filter(w => words2.includes(w));
    return commonWords.length >= Math.min(words1.length, words2.length) * 0.5;
  }

  private scoreCandidate(candidate: MRCACandidate, matches: TriangulationMatch[], matchedPersons: Array<{ match: TriangulationMatch; person: Person | null }>): void {
    const factors = candidate.convergenceFactors;
    
    // cM scoring
    const avgCM = candidate.matches.reduce((sum, m) => sum + m.sizeCM, 0) / candidate.matches.length;
    factors.cM = Math.min(avgCM / 50, 1) * 100; // Normalize to 0-100

    // Triangulation depth
    factors.triangulationDepth = (candidate.matches.length / matches.length) * 100;

    // GEDCOM convergence
    const uniqueLineages = new Set(candidate.matches.map(m => m.matchName)).size;
    factors.gedcomConvergence = (uniqueLineages / matches.length) * 100;

    // Surname matching
    const candidateSurnames = candidate.person.surnames.map(s => s.toLowerCase());
    const matchSurnames = candidate.matches.flatMap(m => m.surnames.map(s => s.toLowerCase()));
    const surnameOverlap = candidateSurnames.filter(s => matchSurnames.includes(s)).length;
    factors.surnameMatch = Math.min(surnameOverlap / candidateSurnames.length, 1) * 100;

    // Haplogroup consistency
    const yHaplos = candidate.matches.filter(m => m.yHaplogroup).map(m => m.yHaplogroup);
    const mtHaplos = candidate.matches.filter(m => m.mtDNA).map(m => m.mtDNA);
    factors.haplogroupConsistency = (new Set(yHaplos).size <= 1 && new Set(mtHaplos).size <= 1) ? 100 : 0;

    // Lifespan scoring
    factors.lifespanScore = this.calculateLifespanScore(candidate, matchedPersons);

    // Location scoring
    factors.locationScore = this.calculateLocationScore(candidate, matchedPersons);

    // Calculate final score
    candidate.score = 
      factors.cM * this.weights.cM +
      factors.triangulationDepth * this.weights.triangulationDepth +
      factors.gedcomConvergence * this.weights.gedcomConvergence +
      factors.surnameMatch * this.weights.surnameMatch +
      factors.haplogroupConsistency * this.weights.haplogroupConsistency +
      factors.lifespanScore * this.weights.lifespanScore +
      factors.locationScore * this.weights.locationScore;

    // Generate explanations
    this.generateExplanations(candidate);

    // Estimate generations
    candidate.generationEstimate = Math.round(avgCM / 7); // Rough estimate: ~7cM per generation
  }

  private calculateLifespanScore(candidate: MRCACandidate, matchedPersons: Array<{ match: TriangulationMatch; person: Person | null }>): number {
    if (!candidate.person.birthYear && !candidate.person.deathYear) return 50; // Neutral score

    let score = 0;
    let validComparisons = 0;

    matchedPersons.forEach(({ person }) => {
      if (!person?.birthYear) return;

      const estimatedMRCADeathYear = candidate.person.deathYear || 
        (candidate.person.birthYear ? candidate.person.birthYear + 70 : undefined);

      if (estimatedMRCADeathYear) {
        // MRCA should have died 1-2 generations before match's birth
        const generationGap = person.birthYear - estimatedMRCADeathYear;
        if (generationGap >= 20 && generationGap <= 60) { // 1-2 generations
          score += 100;
        } else if (generationGap >= 0 && generationGap <= 80) { // Plausible range
          score += 70;
        } else {
          score += 20; // Unlikely but possible
        }
        validComparisons++;
      }
    });

    return validComparisons > 0 ? score / validComparisons : 50;
  }

  private calculateLocationScore(candidate: MRCACandidate, matchedPersons: Array<{ match: TriangulationMatch; person: Person | null }>): number {
    const candidateLocations = [
      candidate.person.birthPlace,
      candidate.person.deathPlace,
      candidate.person.marriagePlace
    ].filter(Boolean).map(loc => this.normalizeLocation(loc!));

    if (candidateLocations.length === 0) return 50; // Neutral score

    let score = 0;
    let comparisons = 0;

    matchedPersons.forEach(({ person, match }) => {
      const personLocations = person ? [
        person.birthPlace,
        person.deathPlace,
        person.marriagePlace
      ].filter(Boolean).map(loc => this.normalizeLocation(loc!)) : [];

      // Also check match surnames for location clues
      const surnameLocations = match.surnames
        .filter(s => s.includes(' '))
        .map(s => this.normalizeLocation(s.split(' ').slice(-1)[0]));

      const allMatchLocations = [...personLocations, ...surnameLocations];

      if (allMatchLocations.length > 0) {
        const hasOverlap = candidateLocations.some(cLoc => 
          allMatchLocations.some(mLoc => this.locationsMatch(cLoc, mLoc))
        );
        score += hasOverlap ? 100 : 20;
        comparisons++;
      }
    });

    return comparisons > 0 ? score / comparisons : 50;
  }

  private normalizeLocation(location: string): string {
    return location.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private locationsMatch(loc1: string, loc2: string): boolean {
    const words1 = loc1.split(' ');
    const words2 = loc2.split(' ');
    
    // Check for any common significant words (length > 2)
    return words1.some(w1 => 
      w1.length > 2 && words2.some(w2 => w2.includes(w1) || w1.includes(w2))
    );
  }

  private generateExplanations(candidate: MRCACandidate): void {
    const explanations: string[] = [];
    const factors = candidate.convergenceFactors;

    if (factors.gedcomConvergence > 70) {
      explanations.push(`Present in ${candidate.matches.length} match lineage(s) in GEDCOM`);
    }

    if (factors.surnameMatch > 50) {
      const matchingSurnames = candidate.person.surnames.filter(s => 
        candidate.matches.some(m => m.surnames.some(ms => ms.toLowerCase() === s.toLowerCase()))
      );
      explanations.push(`Surname '${matchingSurnames.join(', ')}' matches participants`);
    }

    if (factors.cM > 60) {
      const avgCM = candidate.matches.reduce((sum, m) => sum + m.sizeCM, 0) / candidate.matches.length;
      explanations.push(`Average segment size ~${avgCM.toFixed(1)} cM suggesting ~${candidate.generationEstimate} generations`);
    }

    if (factors.haplogroupConsistency > 80) {
      explanations.push('Consistent haplogroup patterns across matches');
    }

    if (factors.lifespanScore > 70) {
      explanations.push('Lifespan aligns with expected generational timing');
    }

    if (factors.locationScore > 70) {
      explanations.push('Geographic locations align with match origins');
    }

    candidate.explanations = explanations;
  }

  private getSegmentDescription(matches: TriangulationMatch[]): string {
    const minStart = Math.min(...matches.map(m => m.startPosition));
    const maxEnd = Math.max(...matches.map(m => m.endPosition));
    return `${minStart.toFixed(1)}–${maxEnd.toFixed(1)} Mb`;
  }

  private calculateConfidence(candidates: MRCACandidate[]): 'Low' | 'Medium' | 'High' | 'Very High' {
    if (candidates.length === 0) return 'Low';
    
    const topScore = candidates[0].score;
    
    if (topScore > 80) return 'Very High';
    if (topScore > 60) return 'High';
    if (topScore > 40) return 'Medium';
    return 'Low';
  }
}