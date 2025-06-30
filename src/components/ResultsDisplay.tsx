import React, { useRef } from 'react';
import { ACEResult } from '../types/genealogy';
import { Users, MapPin, Calendar, Star, TrendingUp, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ResultsDisplayProps {
  results: ACEResult[];
  gedcomFileName: string;
  triangulationFileName: string;
}

export function ResultsDisplay({ results, gedcomFileName, triangulationFileName }: ResultsDisplayProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  if (results.length === 0) return null;

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'Very High': return 'text-emerald-600 bg-emerald-100';
      case 'High': return 'text-blue-600 bg-blue-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportToPDF = async () => {
    if (!contentRef.current) return;

    try {
      const pdfContainer = document.createElement('div');
      pdfContainer.style.position = 'absolute';
      pdfContainer.style.left = '-9999px';
      pdfContainer.style.width = '210mm';
      pdfContainer.style.backgroundColor = 'white';
      pdfContainer.style.padding = '20px';
      pdfContainer.style.fontFamily = 'Arial, sans-serif';

      const clonedContent = contentRef.current.cloneNode(true) as HTMLElement;

      const header = document.createElement('div');
      header.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px;">
          <h1 style="font-size: 28px; font-weight: bold; color: #1f2937;">Ancestral Convergence Engine (ACE)</h1>
          <p style="font-size: 16px; color: #6b7280;">DNA Triangulation Analysis Results</p>
        </div>
      `;

      pdfContainer.appendChild(header);
      pdfContainer.appendChild(clonedContent);
      document.body.appendChild(pdfContainer);

      const canvas = await html2canvas(pdfContainer, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(pdfContainer);

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const pageCount = pdf.getNumberOfPages();
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFillColor(248, 250, 252);
        pdf.rect(0, 280, 210, 17, 'F');
        pdf.setFontSize(8);
        pdf.setTextColor(107, 114, 128);
        pdf.text('Ancestral Convergence Engine (ACE)', 10, 287);
        pdf.text(`Generated: ${currentDate}`, 10, 292);
        pdf.text(`GEDCOM: ${gedcomFileName}`, 200, 287, { align: 'right' });
        pdf.text(`Triangulation: ${triangulationFileName}`, 200, 292, { align: 'right' });
        pdf.text(`Page ${i} of ${pageCount}`, 200, 285, { align: 'right' });
      }

      const fileName = `ACE_Analysis_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ACE Analysis Results
          </h2>
          <p className="text-gray-600">
            Suggested Common Ancestors with convergence analysis
          </p>
        </div>
        <button
          onClick={exportToPDF}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Download size={16} />
          <span>Export PDF</span>
        </button>
      </div>

      <div ref={contentRef} className="space-y-8">
        {results.map((result, resultIndex) => (
          <div key={resultIndex} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-teal-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    Segment {result.segment}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {result.matches.length} triangulated match{result.matches.length !== 1 ? 'es' : ''}
                  </p>
                </div>
                <div className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${getConfidenceColor(result.confidence)}
                `}>
                  {result.confidence} Confidence
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Users size={16} className="mr-2" />
                Triangulated Matches
              </h4>
              <div className="flex flex-wrap gap-2">
                {result.matches.map((match, matchIndex) => (
                  <span
                    key={matchIndex}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200"
                  >
                    {match.matchName}
                    <span className="ml-1 text-gray-500">
                      ({match.sizeCM}cM)
                    </span>
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Suggested Common Ancestors
              </h4>

              {result.suggestedMRCA.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No strong MRCA candidates found in your GEDCOM file.</p>
                  <p className="text-sm mt-2">
                    This could indicate the common ancestor is not in your tree, 
                    or the matches may not be in your GEDCOM database.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {result.suggestedMRCA.map((candidate, candidateIndex) => (
                    <div
                      key={candidateIndex}
                      className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h5 className="text-xl font-semibold text-gray-900">
                            {candidate.person.name}
                          </h5>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            {candidate.person.birthYear && (
                              <span className="flex items-center">
                                <Calendar size={14} className="mr-1" />
                                {candidate.person.birthYear}
                                {candidate.person.deathYear && `–${candidate.person.deathYear}`}
                              </span>
                            )}
                            {candidate.person.birthPlace && (
                              <span className="flex items-center">
                                <MapPin size={14} className="mr-1" />
                                {candidate.person.birthPlace}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${getScoreColor(candidate.score)}`}>
                            {candidate.score.toFixed(0)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ACE Score
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {Object.entries(candidate.convergenceFactors).map(([factor, score]) => (
                          <div key={factor} className="text-center">
                            <div className="text-sm font-medium text-gray-700 capitalize mb-1">
                              {factor.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className={`text-lg font-semibold ${getScoreColor(score)}`}>
                              {score.toFixed(0)}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <h6 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                          <TrendingUp size={16} className="mr-2" />
                          Why This Ancestor?
                        </h6>
                        <ul className="space-y-1">
                          {candidate.explanations.map((explanation, expIndex) => (
                            <li key={expIndex} className="text-sm text-blue-800">
                              • {explanation}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-4 flex items-center text-sm text-gray-600">
                        <Star size={14} className="mr-2" />
                        Estimated {candidate.generationEstimate} generation{candidate.generationEstimate !== 1 ? 's' : ''} ago
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
