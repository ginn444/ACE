import React from 'react';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'idle' | 'parsing' | 'analyzing' | 'complete' | 'error';
  currentStep?: string;
  error?: string;
}

export function ProcessingStatus({ status, currentStep, error }: ProcessingStatusProps) {
  if (status === 'idle') return null;

  const getStatusConfig = () => {
    switch (status) {
      case 'parsing':
        return {
          icon: <Loader2 className="animate-spin" size={20} />,
          text: 'Parsing files...',
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'analyzing':
        return {
          icon: <Loader2 className="animate-spin" size={20} />,
          text: 'Running ACE analysis...',
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      case 'complete':
        return {
          icon: <CheckCircle size={20} />,
          text: 'Analysis complete!',
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200'
        };
      case 'error':
        return {
          icon: <AlertCircle size={20} />,
          text: 'Error occurred',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200'
        };
      default:
        return {
          icon: <Loader2 className="animate-spin" size={20} />,
          text: 'Processing...',
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`
      border rounded-lg p-4 ${config.bgColor} ${config.borderColor}
      transition-all duration-200
    `}>
      <div className="flex items-center space-x-3">
        <div className={config.color}>
          {config.icon}
        </div>
        <div>
          <p className={`font-medium ${config.color}`}>
            {config.text}
          </p>
          {currentStep && (
            <p className="text-sm text-gray-600 mt-1">
              {currentStep}
            </p>
          )}
          {error && (
            <p className="text-sm text-red-600 mt-1">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}