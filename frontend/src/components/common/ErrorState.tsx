import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Unavailable',
  message = 'An error occurred while communicating with the server.',
  onRetry,
  isRetrying = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-lg border border-red-200 bg-red-50/40',
        className
      )}
    >
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-700 mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-red-900">{title}</h4>
      <p className="mt-1 text-xs text-red-700 max-w-md">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          isLoading={isRetrying}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="mt-4 border-red-300 text-red-800 hover:bg-red-50"
        >
          Retry Request
        </Button>
      )}
    </div>
  );
};
