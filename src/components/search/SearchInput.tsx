import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export function SearchInput({ onSearch, isLoading }: SearchInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Input
        type="text"
        placeholder="Search messages..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pr-10"
        disabled={isLoading}
      />
      <button
        type="submit"
        className={`absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        disabled={isLoading}
      >
        <Search className="h-5 w-5" />
      </button>
    </form>
  );
} 