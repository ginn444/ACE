import { TriangulationMatch } from '../types/genealogy';

export function parseTriangulationCSV(csvContent: string): TriangulationMatch[] {
  const lines = csvContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length === 0) return [];

  const headers = lines[0].split(/[,\t]/).map(h => h.trim().replace(/"/g, ''));
  const matches: TriangulationMatch[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    
    if (values.length >= headers.length) {
      const match: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index]?.trim().replace(/"/g, '') || '';
        
        switch (header.toLowerCase()) {
          case 'match name':
            match.matchName = value;
            break;
          case 'source file':
            match.sourceFile = value;
            break;
          case 'start position':
            match.startPosition = parseFloat(value) || 0;
            break;
          case 'end position':
            match.endPosition = parseFloat(value) || 0;
            break;
          case 'size (cm)':
            match.sizeCM = parseFloat(value) || 0;
            break;
          case 'snps':
            match.snps = parseInt(value) || 0;
            break;
          case 'y-haplogroup':
            match.yHaplogroup = value || undefined;
            break;
          case 'mtdna':
            match.mtDNA = value || undefined;
            break;
          case 'surnames':
            match.surnames = value ? value.split(/[,;|]/).map(s => s.trim()).filter(s => s.length > 0) : [];
            break;
        }
      });

      if (match.matchName && match.sizeCM > 0) {
        matches.push(match as TriangulationMatch);
      }
    }
  }

  return matches;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === '\t') && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}