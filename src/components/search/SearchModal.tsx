import { Dialog, DialogContent } from '../ui/dialog';
import Spinner from '../ui/Spinner';
import { SearchInput } from './SearchInput';
import type { MessageSearchResponse } from '../../api/ai';

interface SearchModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  error: string | null;
  searchResult: MessageSearchResponse | null;
  onSearch: (query: string) => void;
}

export function SearchModal({
  isOpen,
  onOpenChange,
  isLoading,
  error,
  searchResult,
  onSearch
}: SearchModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-background-primary border-none max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Search Messages</h2>
        </div>

        <div className="space-y-4">
          <div className="w-full">
            <SearchInput onSearch={onSearch} isLoading={isLoading} />
          </div>

          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Spinner />
            </div>
          )}

          {error && (
            <div className="text-red-500 p-4 rounded bg-red-500/10">
              {error}
            </div>
          )}

          {!isLoading && !error && searchResult && (
            <div className="space-y-4">
              <div className="prose dark:prose-invert">
                <p>{searchResult.response}</p>
              </div>
              
              {searchResult.ai_response && (
                <div className="mt-4 p-4 bg-background-secondary rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Answer</h3>
                  <p className="text-sm text-text-secondary whitespace-pre-wrap">
                    {searchResult.ai_response}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 