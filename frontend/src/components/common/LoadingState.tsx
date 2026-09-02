import React from 'react';
import { Spinner } from '../ui/Spinner';
import { cn } from '../../utils/cn';

export interface LoadingStateProps {
  message?: string;
  description?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading data...',
  description,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-12 text-center rounded-lg border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      <Spinner size="lg" className="mb-3" />
      <p className="text-sm font-semibold text-slate-800">{message}</p>
      {description && <p className="mt-1 text-xs text-slate-500 max-w-sm">{description}</p>}
    </div>
  );
};
