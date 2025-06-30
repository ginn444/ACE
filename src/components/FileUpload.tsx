import React, { useCallback } from 'react';
import { Upload, FileText, Dna } from 'lucide-react';

interface FileUploadProps {
  onGedcomUpload: (file: File) => void;
  onTriangulationUpload: (file: File) => void;
  gedcomFile: File | null;
  triangulationFile: File | null;
  isProcessing: boolean;
}

export function FileUpload({ 
  onGedcomUpload, 
  onTriangulationUpload, 
  gedcomFile, 
  triangulationFile,
  isProcessing 
}: FileUploadProps) {
  const handleGedcomDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const gedcomFile = files.find(file => 
      file.name.toLowerCase().endsWith('.ged') || 
      file.name.toLowerCase().endsWith('.gedcom')
    );
    if (gedcomFile) {
      onGedcomUpload(gedcomFile);
    }
  }, [onGedcomUpload]);

  const handleTriangulationDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const csvFile = files.find(file => file.name.toLowerCase().endsWith('.csv'));
    if (csvFile) {
      onTriangulationUpload(csvFile);
    }
  }, [onTriangulationUpload]);

  const preventDefault = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* GEDCOM Upload */}
      <div
        onDrop={handleGedcomDrop}
        onDragOver={preventDefault}
        onDragEnter={preventDefault}
        className="relative group cursor-pointer"
      >
        <input
          type="file"
          accept=".ged,.gedcom"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onGedcomUpload(file);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${gedcomFile 
            ? 'border-emerald-500 bg-emerald-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <div className="flex flex-col items-center space-y-4">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${gedcomFile 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-500'
              }
            `}>
              <FileText size={32} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                GEDCOM Family Tree
              </h3>
              {gedcomFile ? (
                <div className="text-emerald-600">
                  <p className="font-medium">{gedcomFile.name}</p>
                  <p className="text-sm text-emerald-500">
                    {(gedcomFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p>Drop your GEDCOM file here</p>
                  <p className="text-sm mt-1">or click to browse</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Triangulation CSV Upload */}
      <div
        onDrop={handleTriangulationDrop}
        onDragOver={preventDefault}
        onDragEnter={preventDefault}
        className="relative group cursor-pointer"
      >
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onTriangulationUpload(file);
          }}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isProcessing}
        />
        
        <div className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
          ${triangulationFile 
            ? 'border-emerald-500 bg-emerald-50' 
            : 'border-gray-300 hover:border-teal-400 hover:bg-teal-50'
          }
          ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
        `}>
          <div className="flex flex-col items-center space-y-4">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${triangulationFile 
                ? 'bg-emerald-100 text-emerald-600' 
                : 'bg-gray-100 text-gray-400 group-hover:bg-teal-100 group-hover:text-teal-500'
              }
            `}>
              <Dna size={32} />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                DNA Triangulation Data
              </h3>
              {triangulationFile ? (
                <div className="text-emerald-600">
                  <p className="font-medium">{triangulationFile.name}</p>
                  <p className="text-sm text-emerald-500">
                    {(triangulationFile.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p>Drop your CSV file here</p>
                  <p className="text-sm mt-1">or click to browse</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}