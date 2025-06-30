import { Person, AncestryGraph } from '../types/genealogy';

export class GEDCOMParser {
  private lines: string[] = [];
  private currentIndex = 0;

  parse(gedcomContent: string): AncestryGraph {
    this.lines = gedcomContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    this.currentIndex = 0;

    const individuals: Person[] = [];
    const families: { [id: string]: { husband?: string; wife?: string; children: string[] } } = {};

    while (this.currentIndex < this.lines.length) {
      const line = this.lines[this.currentIndex];
      
      if (line.includes('INDI')) {
        const individual = this.parseIndividual();
        if (individual) {
          individuals.push(individual);
        }
      } else if (line.includes('FAM')) {
        const family = this.parseFamily();
        if (family) {
          const familyId = this.extractId(line);
          families[familyId] = family;
        }
      } else {
        this.currentIndex++;
      }
    }

    // Link parents to children
    this.linkFamilies(individuals, families);

    // Build ancestry graph
    return this.buildAncestryGraph(individuals);
  }

  private parseIndividual(): Person | null {
    const startLine = this.lines[this.currentIndex];
    const id = this.extractId(startLine);
    
    let name = '';
    let birthYear: number | undefined;
    let deathYear: number | undefined;
    let birthPlace: string | undefined;
    let deathPlace: string | undefined;
    let marriagePlace: string | undefined;

    this.currentIndex++;

    while (this.currentIndex < this.lines.length && this.getLevel(this.lines[this.currentIndex]) > 0) {
      const line = this.lines[this.currentIndex];
      const level = this.getLevel(line);

      if (level === 1) {
        if (line.includes('NAME')) {
          name = this.extractValue(line).replace(/\//g, '');
        } else if (line.includes('BIRT')) {
          const birthInfo = this.parseEvent();
          birthYear = birthInfo.year;
          birthPlace = birthInfo.place;
          continue;
        } else if (line.includes('DEAT')) {
          const deathInfo = this.parseEvent();
          deathYear = deathInfo.year;
          deathPlace = deathInfo.place;
          continue;
        } else if (line.includes('MARR')) {
          const marriageInfo = this.parseEvent();
          marriagePlace = marriageInfo.place;
          continue;
        }
      }

      this.currentIndex++;
    }

    if (name) {
      const surnames = this.extractSurnames(name);
      return {
        id,
        name,
        birthYear,
        deathYear,
        parentIds: [],
        surnames,
        birthPlace,
        deathPlace,
        marriagePlace
      };
    }

    return null;
  }

  private parseFamily(): { husband?: string; wife?: string; children: string[] } | null {
    this.currentIndex++;
    
    let husband: string | undefined;
    let wife: string | undefined;
    const children: string[] = [];

    while (this.currentIndex < this.lines.length && this.getLevel(this.lines[this.currentIndex]) > 0) {
      const line = this.lines[this.currentIndex];
      
      if (line.includes('HUSB')) {
        husband = this.extractValue(line).replace('@', '').replace('@', '');
      } else if (line.includes('WIFE')) {
        wife = this.extractValue(line).replace('@', '').replace('@', '');
      } else if (line.includes('CHIL')) {
        children.push(this.extractValue(line).replace('@', '').replace('@', ''));
      }

      this.currentIndex++;
    }

    return { husband, wife, children };
  }

  private parseEvent(): { year?: number; place?: string } {
    let year: number | undefined;
    let place: string | undefined;

    this.currentIndex++;

    while (this.currentIndex < this.lines.length && this.getLevel(this.lines[this.currentIndex]) === 2) {
      const line = this.lines[this.currentIndex];

      if (line.includes('DATE')) {
        const dateStr = this.extractValue(line);
        year = this.extractYear(dateStr);
      } else if (line.includes('PLAC')) {
        place = this.extractValue(line);
      }

      this.currentIndex++;
    }

    return { year, place };
  }

  private linkFamilies(individuals: Person[], families: { [id: string]: { husband?: string; wife?: string; children: string[] } }): void {
    const personMap = new Map(individuals.map(p => [p.id, p]));

    Object.values(families).forEach(family => {
      family.children.forEach(childId => {
        const child = personMap.get(childId);
        if (child) {
          if (family.husband) child.parentIds.push(family.husband);
          if (family.wife) child.parentIds.push(family.wife);
        }
      });
    });
  }

  private buildAncestryGraph(individuals: Person[]): AncestryGraph {
    const personMap = new Map(individuals.map(p => [p.id, p]));
    const graph: AncestryGraph = {};

    individuals.forEach(person => {
      const ancestors = this.getAncestors(person, personMap, new Set(), 10);
      graph[person.id] = {
        person,
        ancestors
      };
    });

    return graph;
  }

  private getAncestors(person: Person, personMap: Map<string, Person>, visited: Set<string>, maxGenerations: number): Person[] {
    if (maxGenerations <= 0 || visited.has(person.id)) {
      return [];
    }

    visited.add(person.id);
    const ancestors: Person[] = [];

    person.parentIds.forEach(parentId => {
      const parent = personMap.get(parentId);
      if (parent) {
        ancestors.push(parent);
        ancestors.push(...this.getAncestors(parent, personMap, new Set(visited), maxGenerations - 1));
      }
    });

    return ancestors;
  }

  private extractId(line: string): string {
    const match = line.match(/@([^@]+)@/);
    return match ? match[1] : '';
  }

  private extractValue(line: string): string {
    const parts = line.split(' ');
    return parts.slice(2).join(' ');
  }

  private getLevel(line: string): number {
    const match = line.match(/^(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  private extractYear(dateStr: string): number | undefined {
    const yearMatch = dateStr.match(/(\d{4})/);
    return yearMatch ? parseInt(yearMatch[1]) : undefined;
  }

  private extractSurnames(name: string): string[] {
    // Extract surnames - typically the last word or words in caps
    const words = name.split(' ').filter(w => w.length > 0);
    const surnames: string[] = [];
    
    // Look for capitalized words that might be surnames
    words.forEach(word => {
      if (word === word.toUpperCase() && word.length > 1) {
        surnames.push(word);
      }
    });

    // If no obvious surnames, take the last word
    if (surnames.length === 0 && words.length > 0) {
      surnames.push(words[words.length - 1]);
    }

    return surnames;
  }
}