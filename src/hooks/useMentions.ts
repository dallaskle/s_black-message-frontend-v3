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
      console.log('Empty query, clearing suggestions');
      setSuggestions([]);
      return;
    }

    console.log('Searching mentions for query:', query);
    setIsLoading(true);
    setError(null);

    try {
      // Use cloneApi to fetch clones
      const response = await cloneApi.listClones(currentWorkspace?.id);
      const clones = response.data as Clone[];
      console.log('Fetched clones:', clones.length, 'total clones');

      // Filter and sort clones based on query
      const filteredClones = clones
        .filter((clone: Clone) => {
          const matches = clone.name.toLowerCase().includes(query.toLowerCase());
          const isVisible = clone.visibility === 'global' || clone.workspace_id === currentWorkspace?.id;
          console.log(`Clone ${clone.name}: matches=${matches}, visible=${isVisible}`);
          return matches && isVisible;
        })
        .sort((a: Clone, b: Clone) => {
          // Sort workspace clones before global ones
          if (a.workspace_id === currentWorkspace?.id && b.visibility === 'global') return -1;
          if (a.visibility === 'global' && b.workspace_id === currentWorkspace?.id) return 1;
          return a.name.localeCompare(b.name);
        });

      console.log('Filtered suggestions:', filteredClones.map(c => ({ name: c.name, visibility: c.visibility })));
      setSuggestions(filteredClones);
    } catch (err) {
      console.error('Error fetching clone suggestions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch clone suggestions');
    } finally {
      setIsLoading(false);
    }
  }, [currentWorkspace?.id]);

  const formatMessageWithMentions = useCallback((content: string) => {
    const formattedContent = content.replace(/@(\w+)/g, (match, name) => {
      const clone = suggestions.find(c => c.name.toLowerCase() === name.toLowerCase());
      console.log(`Formatting mention: ${name}`, clone ? `-> ID: ${clone.id}` : '(no match found)');
      return clone ? `@${name}[id:${clone.id}]` : match;
    });
    console.log('Formatted content:', formattedContent);
    return formattedContent;
  }, [suggestions]);

  const extractVisibleContent = useCallback((content: string) => {
    const visibleContent = content.replace(/@(\w+)\[id:[^\]]+\]/g, '@$1');
    console.log('Extracted visible content:', visibleContent);
    return visibleContent;
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