import apiClient from "./api/client";

/**
 * Search Types
 */
export type SearchType = "all" | "users" | "posts" | "restaurants";

/**
 * User Search Result
 */
export interface UserSearchResult {
  id: string;
  username: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  followersCount?: number;
  isFollowing?: boolean;
  type: "user";
}

/**
 * Post Search Result
 */
export interface PostSearchResult {
  id: string;
  content: string;
  imageUrls: string[];
  createdAt: Date;
  user: {
    id: string;
    username: string;
    name: string;
    avatar?: string;
  };
  establishment?: {
    id: string;
    name: string;
  };
  likesCount: number;
  commentsCount: number;
  type: "post";
}

/**
 * Restaurant Search Result
 */
export interface RestaurantSearchResult {
  id: string;
  name: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  cuisine?: string;
  priceRange: number;
  rating: number;
  imageUrl?: string;
  type: "restaurant";
}

/**
 * Combined Search Result
 */
export type SearchResult =
  | UserSearchResult
  | PostSearchResult
  | RestaurantSearchResult;

/**
 * Search Response
 */
export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  type: SearchType;
}

/**
 * Search Service
 * Handles search API calls
 */
class SearchService {
  /**
   * Search with query and filters
   */
  async search(
    query: string,
    type: SearchType = "all",
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponse> {
    const response = await apiClient.get<SearchResponse>("/search", {
      params: {
        query,
        type,
        page,
        limit,
      },
    });

    // Parse dates for post results
    const parsedResults = response.results.map((result) => {
      if (result.type === "post") {
        return {
          ...result,
          createdAt: new Date(result.createdAt),
        };
      }
      return result;
    });

    return {
      ...response,
      results: parsedResults,
    };
  }

  /**
   * Search users only
   */
  async searchUsers(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponse> {
    return this.search(query, "users", page, limit);
  }

  /**
   * Search posts only
   */
  async searchPosts(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponse> {
    return this.search(query, "posts", page, limit);
  }

  /**
   * Search restaurants only
   */
  async searchRestaurants(
    query: string,
    page: number = 1,
    limit: number = 20
  ): Promise<SearchResponse> {
    return this.search(query, "restaurants", page, limit);
  }

  /**
   * Get search suggestions (autocomplete)
   */
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (query.length < 2) {
      return [];
    }

    const response = await apiClient.get<string[]>("/search/suggestions", {
      params: { query, limit },
    });

    return response;
  }
}

export const searchService = new SearchService();
export default searchService;
