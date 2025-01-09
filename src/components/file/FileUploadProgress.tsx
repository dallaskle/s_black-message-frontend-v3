import { XMarkIcon } from '@heroicons/react/24/outline';

interface FileUploadProgressProps {
  fileName: string;
  progress: number;
  error?: string;
  onCancel?: () => void;
}

export function FileUploadProgress({ fileName, progress, error, onCancel }: FileUploadProgressProps) {
  return (
    <div className="flex flex-col gap-1 p-2 bg-background-secondary rounded-lg">
      <div className="flex items-center justify-between">
        <span className="text-sm text-text-primary truncate max-w-[200px]">
          {fileName}
        </span>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-text-secondary hover:text-text-primary"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {error ? (
        <div className="text-xs text-accent-error">{error}</div>
      ) : (
        <>
          <div className="h-1.5 bg-background-primary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-text-secondary">
            {progress === 100 ? 'Upload complete' : `${progress}%`}
          </span>
        </>
      )}
    </div>
  );
} 