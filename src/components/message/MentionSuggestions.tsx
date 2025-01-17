import { type Clone } from '../../types/clone';

interface MentionSuggestionsProps {
  suggestions: Clone[];
  isLoading: boolean;
  error: string | null;
  onSelect: (clone: Clone) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function MentionSuggestions({
  suggestions,
  isLoading,
  error,
  onSelect,
  inputRef,
}: MentionSuggestionsProps) {
  if (!suggestions.length && !isLoading) return null;

  // Calculate position based on input
  const getPosition = () => {
    if (!inputRef.current) return { top: 0, left: 0 };
    
    const caretPosition = inputRef.current.selectionStart || 0;
    const textBeforeCaret = inputRef.current.value.substring(0, caretPosition);
    const atSymbolIndex = textBeforeCaret.lastIndexOf('@');
    
    if (atSymbolIndex === -1) return { top: 0, left: 0 };
    
    // Create a temporary span to measure text width
    const span = document.createElement('span');
    span.style.font = window.getComputedStyle(inputRef.current).font;
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.textContent = textBeforeCaret.substring(0, atSymbolIndex);
    document.body.appendChild(span);
    
    const left = span.offsetWidth;
    document.body.removeChild(span);
    
    return {
      top: -200, // Position above input
      left: left + 8, // Add some padding
    };
  };

  const position = getPosition();

  return (
    <div
      className="mention-suggestions absolute z-50 w-64 max-h-48 overflow-y-auto bg-background-secondary rounded-lg shadow-lg border border-text-secondary/10"
      style={{
        bottom: '100%',
        left: position.left,
        marginBottom: '8px',
      }}
    >
      {isLoading ? (
        <div className="p-2 text-text-secondary">Loading suggestions...</div>
      ) : error ? (
        <div className="p-2 text-accent-error">{error}</div>
      ) : (
        <ul className="py-1">
          {suggestions.map((clone) => (
            <li key={clone.id}>
              <button
                className="w-full px-4 py-2 text-left hover:bg-background-primary flex flex-col gap-1"
                onClick={() => onSelect(clone)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-text-primary font-medium">{clone.name}</span>
                  <span className="text-xs text-text-secondary px-2 py-0.5 rounded-full bg-background-primary">
                    {clone.visibility === 'global' ? 'Global' : 'Workspace'}
                  </span>
                </div>
                {clone.description && (
                  <span className="text-xs text-text-secondary line-clamp-1">
                    {clone.description}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 