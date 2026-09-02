import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileQuestion } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-500 mx-auto flex items-center justify-center">
          <FileQuestion className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">404 - Page Not Found</h1>
          <p className="text-xs text-slate-500 mt-1">
            The requested module or page could not be located in the AGRIPROCURE ERP system.
          </p>
        </div>
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
