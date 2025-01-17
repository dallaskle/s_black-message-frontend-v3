import { useState, useCallback } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Clone } from '../types/clone';
import cloneApi from '../api/clone';

interface UseMentionsResult {
  suggestions: Clone[];
  isLoading: boolean;
  error: string | null;
  searchMentions: (query: string) => void;
  formatMessageWithMentions: (content: string) => string;
  extractVisibleContent: (content: string) => string;
}

export function useMentions(): UseMentionsResult {
  const [suggestions, setSuggestions] = useState<Clone[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  const searchMentions = useCallback(async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Use cloneApi to fetch clones
      const response = await cloneApi.listClones(currentWorkspace?.id);
      const clones = response.data as Clone[];

      // Filter and sort clones based on query
      const filteredClones = clones
        .filter((clone: Clone) => 
          clone.name.toLowerCase().includes(query.toLowerCase()) &&
          (clone.visibility === 'global' || clone.workspace_id === currentWorkspace?.id)
        )
        .sort((a: Clone, b: Clone) => {
          // Sort workspace clones before global ones
          if (a.workspace_id === currentWorkspace?.id && b.visibility === 'global') return -1;
          if (a.visibility === 'global' && b.workspace_id === currentWorkspace?.id) return 1;
          return a.name.localeCompare(b.name);
        });

      setSuggestions(filteredClones);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clone suggestions');
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id]);

  // Format message content to include clone IDs
  const formatMessageWithMentions = useCallback((content: string) => {
    return content.replace(/@(\w+)/g, (match, name) => {
      const clone = suggestions.find(c => c.name.toLowerCase() === name.toLowerCase());
      return clone ? `@${name}[id:${clone.id}]` : match;
    });
  }, [suggestions]);

  // Extract visible content (hide clone IDs)
  const extractVisibleContent = useCallback((content: string) => {
    return content.replace(/@(\w+)\[id:[^\]]+\]/g, '@$1');
  }, []);

  return {
    suggestions,
    isLoading,
    error,
    searchMentions,
    formatMessageWithMentions,
    extractVisibleContent,
  };
} 