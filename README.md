# Ancestral Convergence Engine (ACE)

Advanced DNA triangulation and genealogy analysis using the innovative ACE algorithm that blends DNA segment triangulation, ancestral tree topology, and pattern recognition to identify potential common ancestors.

## 🧬 Overview

The Ancestral Convergence Engine is a sophisticated web application that analyzes DNA triangulation data alongside GEDCOM family trees to suggest potential Most Recent Common Ancestors (MRCA). Using a multi-dimensional scoring algorithm, ACE evaluates various convergence factors to provide confidence-rated ancestor suggestions.

### Key Features

- **Advanced Algorithm**: Multi-dimensional analysis combining DNA segments, genealogy data, and pattern recognition
- **GEDCOM Integration**: Full support for standard GEDCOM family tree files
- **CSV Triangulation**: Flexible CSV parser for DNA triangulation match data
- **Confidence Scoring**: Sophisticated scoring system with detailed explanations
- **Visual Results**: Clean, professional interface with exportable PDF reports
- **Real-time Processing**: Live status updates during analysis

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ancestral-convergence-engine
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## 📁 Input File Requirements

### GEDCOM Family Tree (.ged or .gedcom)

Upload a standard GEDCOM file containing your family tree data. The parser supports:

- Individual records (INDI)
- Family records (FAM)
- Birth, death, and marriage events
- Place and date information
- Parent-child relationships

### DNA Triangulation CSV (.csv)

Your CSV file should include the following headers:

```
Match Name, Source File, Start Position, End Position, Size (cM), SNPs, Y-Haplogroup, mtDNA, Surnames
```

**Note**: You can generate the required triangulation CSV file using the [DNA Triangulation Calculator](https://dnatriangulationcalculator.netlify.app), which allows you to export triangulated matches in the correct format for use with ACE.

#### Required Fields:
- **Match Name**: Name of the DNA match
- **Start Position**: Segment start position (Mb)
- **End Position**: Segment end position (Mb)
- **Size (cM)**: Segment size in centimorgans

#### Optional Fields:
- **Y-Haplogroup**: Y-chromosome haplogroup
- **mtDNA**: Mitochondrial DNA haplogroup
- **Surnames**: Comma-separated list of surnames
- **SNPs**: Number of SNPs in the segment

#### Example CSV Format:
```csv
Match Name,Source File,Start Position,End Position,Size (cM),SNPs,Y-Haplogroup,mtDNA,Surnames
John Smith,kit123.csv,45.2,67.8,12.5,2847,R1b,H1a,Smith Johnson
Mary Johnson,kit456.csv,44.1,69.2,15.3,3201,,,Johnson Williams
```

## 🔬 How ACE Works

The Ancestral Convergence Engine uses a sophisticated multi-factor scoring algorithm:

### Convergence Factors

1. **cM Analysis (30% weight)**: Evaluates segment sizes and their implications for generational distance
2. **GEDCOM Convergence (25% weight)**: Analyzes how well candidates appear across multiple match lineages
3. **Lifespan Scoring (15% weight)**: Validates temporal consistency between ancestor lifespans and match generations
4. **Location Scoring (15% weight)**: Compares geographic information between ancestors and matches
5. **Triangulation Depth (10% weight)**: Measures how many matches share segments with the candidate
6. **Surname Matching (5% weight)**: Identifies surname overlaps between ancestors and matches
7. **Haplogroup Consistency (5% weight)**: Validates genetic marker consistency

### Confidence Levels

- **Very High (80+ score)**: Strong evidence across multiple factors
- **High (60-79 score)**: Good evidence with some supporting factors
- **Medium (40-59 score)**: Moderate evidence, requires additional validation
- **Low (<40 score)**: Weak evidence, consider alternative candidates

## 📊 Understanding Results

### ACE Score
Each suggested ancestor receives a comprehensive score (0-100) based on the weighted convergence factors.

### Explanations
The system provides detailed explanations for why each ancestor was suggested, including:
- Genealogical evidence from your GEDCOM
- DNA segment analysis
- Geographic and temporal consistency
- Surname and haplogroup patterns

### Generation Estimates
ACE estimates the generational distance to each suggested ancestor based on average centimorgan inheritance patterns.

## 🛠️ Technical Details

### Built With
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Fast build tool and dev server
- **Lucide React** - Beautiful icons
- **jsPDF & html2canvas** - PDF export functionality

### Architecture
- **Modular Design**: Clean separation of concerns across components
- **Type Safety**: Full TypeScript implementation
- **Responsive UI**: Mobile-first design approach
- **Error Handling**: Comprehensive error management and user feedback

## 📈 Algorithm Details

The ACE algorithm processes data in several phases:

1. **Parsing Phase**: GEDCOM and CSV data extraction and validation
2. **Matching Phase**: Cross-reference DNA matches with GEDCOM individuals
3. **Clustering Phase**: Group overlapping DNA segments
4. **Scoring Phase**: Multi-dimensional analysis of potential ancestors
5. **Ranking Phase**: Sort and filter results by confidence scores

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

### Development Guidelines
- Follow TypeScript best practices
- Maintain component modularity
- Add comprehensive error handling
- Include meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔬 Scientific Background

The ACE algorithm is based on established principles in genetic genealogy:

- **Triangulation Theory**: Shared DNA segments indicate common ancestry
- **Inheritance Patterns**: Statistical models of DNA inheritance across generations
- **Genealogical Proof Standards**: Evidence evaluation and correlation methods
- **Population Genetics**: Haplogroup and geographic ancestry patterns

## 📞 Support

For questions, issues, or feature requests, please open an issue on the project repository.

---

**Powered by the Ancestral Convergence Engine (ACE) algorithm**  
*Blending DNA segment triangulation, ancestral tree topology, and pattern recognition*