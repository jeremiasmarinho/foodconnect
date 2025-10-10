import { useState, useCallback, useEffect } from "react";
import searchService, {
  SearchType,
  SearchResult,
  SearchResponse,
} from "../services/search";

export interface UseSearchReturn {
  results: SearchResult[];
  suggestions: string[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  total: number;
  query: string;
  searchType: SearchType;

  // Actions
  search: (query: string, type?: SearchType) => Promise<void>;
  loadMore: () => Promise<void>;
  getSuggestions: (query: string) => Promise<void>;
  clearResults: () => void;
  setSearchType: (type: SearchType) => void;
}

/**
 * Custom hook for search functionality
 * Handles searching users, posts, and restaurants
 */
export function useSearch(initialType: SearchType = "all"): UseSearchReturn {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<SearchType>(initialType);

  /**
   * Perform search
   */
  const search = useCallback(
    async (searchQuery: string, type: SearchType = searchType) => {
      if (!searchQuery.trim()) {
        setResults([]);
        setTotal(0);
        setHasMore(false);
        return;
      }

      setLoading(true);
      setError(null);
      setQuery(searchQuery);
      setSearchType(type);
      setCurrentPage(1);

      try {
        const response: SearchResponse = await searchService.search(
          searchQuery,
          type,
          1,
          20
        );

        setResults(response.results);
        setTotal(response.total);
        setHasMore(response.hasMore);
        setCurrentPage(1);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to perform search"
        );
        setResults([]);
      } finally {
        setLoading(false);
      }
    },
    [searchType]
  );

  /**
   * Load more results (pagination)
   */
  const loadMore = useCallback(async () => {
    if (!query || !hasMore || loading) return;

    setLoading(true);
    setError(null);

    try {
      const nextPage = currentPage + 1;
      const response: SearchResponse = await searchService.search(
        query,
        searchType,
        nextPage,
        20
      );

      setResults((prev) => [...prev, ...response.results]);
      setHasMore(response.hasMore);
      setCurrentPage(nextPage);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load more results"
      );
    } finally {
      setLoading(false);
    }
  }, [query, hasMore, loading, currentPage, searchType]);

  /**
   * Get autocomplete suggestions
   */
  const getSuggestions = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const sugg = await searchService.getSuggestions(searchQuery, 5);
      setSuggestions(sugg);
    } catch (err) {
      console.error("Failed to get suggestions:", err);
      setSuggestions([]);
    }
  }, []);

  /**
   * Clear search results
   */
  const clearResults = useCallback(() => {
    setResults([]);
    setQuery("");
    setTotal(0);
    setHasMore(false);
    setCurrentPage(1);
    setError(null);
    setSuggestions([]);
  }, []);

  /**
   * Debounced suggestions when query changes
   */
  useEffect(() => {
    if (query.length >= 2) {
      const timeoutId = setTimeout(() => {
        getSuggestions(query);
      }, 300); // 300ms debounce

      return () => clearTimeout(timeoutId);
    } else {
      setSuggestions([]);
    }
  }, [query, getSuggestions]);

  return {
    results,
    suggestions,
    loading,
    error,
    hasMore,
    currentPage,
    total,
    query,
    searchType,
    search,
    loadMore,
    getSuggestions,
    clearResults,
    setSearchType,
  };
}

export default useSearch;
