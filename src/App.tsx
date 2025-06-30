import React, { useState, useCallback } from 'react';
import { Dna, GitBranch, Sparkles, RotateCcw } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { ProcessingStatus } from './components/ProcessingStatus';
import { ResultsDisplay } from './components/ResultsDisplay';
import { GEDCOMParser } from './utils/gedcomParser';
import { parseTriangulationCSV } from './utils/csvParser';
import { ACEAlgorithm } from './utils/aceAlgorithm';
import { ACEResult, AncestryGraph, TriangulationMatch } from './types/genealogy';

type ProcessingState = 'idle' | 'parsing' | 'analyzing' | 'complete' | 'error';

function App() {
  const [gedcomFile, setGedcomFile] = useState<File | null>(null);
  const [triangulationFile, setTriangulationFile] = useState<File | null>(null);
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [currentStep, setCurrentStep] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [results, setResults] = useState<ACEResult[]>([]);

  const processFiles = useCallback(async () => {
    if (!gedcomFile || !triangulationFile) return;

    setProcessingState('parsing');
    setError('');

    try {
      // Parse GEDCOM
      setCurrentStep('Parsing GEDCOM family tree...');
      const gedcomContent = await gedcomFile.text();
      const parser = new GEDCOMParser();
      const ancestryGraph: AncestryGraph = parser.parse(gedcomContent);

      // Parse triangulation CSV
      setCurrentStep('Parsing triangulation data...');
      const csvContent = await triangulationFile.text();
      const triangulationMatches: TriangulationMatch[] = parseTriangulationCSV(csvContent);

      if (triangulationMatches.length === 0) {
        throw new Error('No valid triangulation matches found in CSV file');
      }

      // Run ACE analysis
      setProcessingState('analyzing');
      setCurrentStep('Running Ancestral Convergence Engine analysis...');
      
      const aceAlgorithm = new ACEAlgorithm();
      const aceResults = aceAlgorithm.analyzeTriangulation(triangulationMatches, ancestryGraph);

      setResults(aceResults);
      setProcessingState('complete');
      setCurrentStep('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setProcessingState('error');
    }
  }, [gedcomFile, triangulationFile]);

  // Auto-process when both files are uploaded
  React.useEffect(() => {
    if (gedcomFile && triangulationFile && processingState === 'idle') {
      processFiles();
    }
  }, [gedcomFile, triangulationFile, processingState, processFiles]);

  const resetAnalysis = useCallback(() => {
    setGedcomFile(null);
    setTriangulationFile(null);
    setProcessingState('idle');
    setResults([]);
    setError('');
    setCurrentStep('');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
              <Dna className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Ancestral Convergence Engine
              </h1>
              <p className="text-gray-600 mt-1">
                Advanced DNA triangulation and genealogy analysis using ACE algorithm
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {results.length === 0 ? (
          <div className="space-y-8">
            {/* Introduction */}
            <div className="text-center space-y-4">
              <div className="flex justify-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-blue-600" />
                </div>
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <Dna className="w-4 h-4 text-teal-600" />
                </div>
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Upload Your Genealogy Data
              </h2>
              <p className="text-gray-600 max-w-3xl mx-auto">
                Upload your GEDCOM family tree and DNA triangulation CSV file to discover suggested 
                common ancestors using our innovative multi-dimensional analysis algorithm.
              </p>
            </div>

            {/* File Upload */}
            <FileUpload
              onGedcomUpload={setGedcomFile}
              onTriangulationUpload={setTriangulationFile}
              gedcomFile={gedcomFile}
              triangulationFile={triangulationFile}
              isProcessing={processingState !== 'idle'}
            />

            {/* Processing Status */}
            <ProcessingStatus
              status={processingState}
              currentStep={currentStep}
              error={error}
            />

            {/* Reset Button - Only show when there's an error */}
            {processingState === 'error' && (
              <div className="flex justify-center">
                <button
                  onClick={resetAnalysis}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  <RotateCcw size={20} />
                  <span>Reset and Try Again</span>
                </button>
              </div>
            )}

            {/* CSV Format Guide */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                CSV Format Requirements
              </h3>
              <p className="text-gray-600 mb-4">
                Your triangulation CSV should include these headers:
              </p>
              <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                Match Name, Source File, Start Position, End Position, Size (cM), SNPs, Y-Haplogroup, mtDNA, Surnames
              </div>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Required Fields:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Match Name</li>
                    <li>• Start/End Position</li>
                    <li>• Size (cM)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Optional Fields:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Y-Haplogroup, mtDNA</li>
                    <li>• Surnames (comma-separated)</li>
                    <li>• SNPs count</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Analysis Complete</h2>
                <p className="text-gray-600">
                  Found {results.reduce((sum, r) => sum + r.suggestedMRCA.length, 0)} potential common ancestors
                </p>
              </div>
              <button
                onClick={resetAnalysis}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                New Analysis
              </button>
            </div>

            {/* Results */}
            <ResultsDisplay 
              results={results} 
              gedcomFileName={gedcomFile?.name || 'Unknown GEDCOM file'}
              triangulationFileName={triangulationFile?.name || 'Unknown CSV file'}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>
              Powered by the Ancestral Convergence Engine (ACE) algorithm
            </p>
            <p className="text-sm mt-2">
              Blending DNA segment triangulation, ancestral tree topology, and pattern recognition
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;