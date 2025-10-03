import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { postsApi } from "../services/api";
import {
  CreatePostRequest,
  Post,
  Comment,
  CreateCommentRequest,
  PaginatedResponse,
} from "../types";

// Query keys for posts
export const postKeys = {
  all: ["posts"] as const,
  lists: () => [...postKeys.all, "list"] as const,
  list: (filters: string) => [...postKeys.lists(), { filters }] as const,
  details: () => [...postKeys.all, "detail"] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
  comments: (postId: string) =>
    [...postKeys.detail(postId), "comments"] as const,
};

// Fetch posts with infinite scroll
export const usePosts = (filters?: { page?: number; limit?: number }) => {
  return useInfiniteQuery({
    queryKey: postKeys.list(JSON.stringify(filters)),
    queryFn: ({ pageParam }) =>
      postsApi.getPosts({
        page: pageParam as number,
        limit: filters?.limit || 10,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage: PaginatedResponse<Post>, allPages) => {
      const totalPages = Math.ceil(lastPage.total / (filters?.limit || 10));
      return allPages.length < totalPages ? allPages.length + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Fetch single post
export const usePost = (postId: string) => {
  return useQuery({
    queryKey: postKeys.detail(postId),
    queryFn: () => postsApi.getPost(postId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!postId,
  });
};

// Create post
export const useCreatePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostRequest) => postsApi.createPost(data),
    onSuccess: () => {
      // Invalidate posts list to refresh feed
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
    onError: (error) => {
      console.error("Create post error:", error);
    },
  });
};

// Like/unlike post
export const useLikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsApi.likePost(postId),
    onSuccess: (_, postId) => {
      // Update post in cache
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

export const useUnlikePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsApi.unlikePost(postId),
    onSuccess: (_, postId) => {
      // Update post in cache
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
};

// Delete post
export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsApi.deletePost(postId),
    onSuccess: (_, postId) => {
      // Remove post from cache
      queryClient.removeQueries({ queryKey: postKeys.detail(postId) });
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
    onError: (error) => {
      console.error("Delete post error:", error);
    },
  });
};

// Post comments
export const usePostComments = (postId: string) => {
  return useQuery({
    queryKey: postKeys.comments(postId),
    queryFn: () => postsApi.getPostComments(postId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!postId,
  });
};

// Add comment
export const useAddComment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      postId,
      data,
    }: {
      postId: string;
      data: CreateCommentRequest;
    }) => postsApi.addComment(postId, data),
    onSuccess: (_, { postId }) => {
      // Refresh comments
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
      // Update post comments count
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
    onError: (error) => {
      console.error("Add comment error:", error);
    },
  });
};
