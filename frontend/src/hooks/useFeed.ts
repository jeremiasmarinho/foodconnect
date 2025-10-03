import { useInfiniteQuery } from "@tanstack/react-query";
import { postsApi } from "../services/api";
import { PaginatedResponse, Post } from "../types";

// Query keys for feed
export const feedKeys = {
  all: ["feed"] as const,
  timeline: (filters: string) =>
    [...feedKeys.all, "timeline", { filters }] as const,
};

// Main feed with infinite scroll
export const useFeed = (filters?: { limit?: number }) => {
  return useInfiniteQuery({
    queryKey: feedKeys.timeline(JSON.stringify(filters)),
    queryFn: ({ pageParam }) =>
      postsApi.getFeed({
        page: pageParam as number,
        limit: filters?.limit || 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<Post>, allPages) => {
      const totalPages = Math.ceil(lastPage.total / (filters?.limit || 10));
      return allPages.length < totalPages ? allPages.length + 1 : undefined;
    },
    staleTime: 1 * 60 * 1000, // 1 minute for fresh feed
  });
};

// Helper hook to get all posts from infinite query
export const useFeedPosts = (filters?: { limit?: number }) => {
  const { data, ...rest } = useFeed(filters);

  const posts = data?.pages.flatMap((page) => page.data) || [];

  return {
    posts,
    ...rest,
  };
};
