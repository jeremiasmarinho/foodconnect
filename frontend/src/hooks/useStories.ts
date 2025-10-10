import { useState, useEffect, useCallback } from "react";
import {
  StoryService,
  UserStories,
  Story,
  CreateStoryRequest,
} from "../services/story";

export interface UseStoriesReturn {
  userStories: UserStories[];
  loading: boolean;
  error: string | null;
  currentStory: Story | null;
  currentUserIndex: number;
  currentStoryIndex: number;

  // Actions
  loadStories: () => Promise<void>;
  createStory: (data: CreateStoryRequest) => Promise<boolean>;
  viewStory: (storyId: string) => Promise<void>;
  deleteStory: (storyId: string) => Promise<boolean>;

  // Navigation
  nextStory: () => void;
  previousStory: () => void;
  goToUserStories: (userIndex: number) => void;
  closeStoryViewer: () => void;
}

export function useStories(): UseStoriesReturn {
  const [userStories, setUserStories] = useState<UserStories[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Story viewer state
  const [currentUserIndex, setCurrentUserIndex] = useState<number>(-1);
  const [currentStoryIndex, setCurrentStoryIndex] = useState<number>(0);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);

  // Load active stories
  const loadStories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await StoryService.getActiveStories();

      if (response.success && response.data) {
        setUserStories(response.data);
      } else {
        setError(response.error || "Erro ao carregar stories");
      }
    } catch (err) {
      setError("Erro ao carregar stories");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new story
  const createStory = useCallback(
    async (data: CreateStoryRequest): Promise<boolean> => {
      setLoading(true);
      setError(null);

      try {
        const response = await StoryService.createStory(data);

        if (response.success) {
          // Reload stories to include the new one
          await loadStories();
          return true;
        } else {
          setError(response.error || "Erro ao criar story");
          return false;
        }
      } catch (err) {
        setError("Erro ao criar story");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loadStories]
  );

  // View story (mark as viewed)
  const viewStory = useCallback(async (storyId: string) => {
    const response = await StoryService.viewStory(storyId);

    if (response.success) {
      // Update local state to mark story as viewed
      setUserStories((prevStories) =>
        prevStories.map((userStory) => ({
          ...userStory,
          stories: userStory.stories.map((story) =>
            story.id === storyId
              ? { ...story, hasViewed: true, viewCount: story.viewCount + 1 }
              : story
          ),
          hasUnviewed: userStory.stories.some(
            (s) => s.id !== storyId && !s.hasViewed
          ),
        }))
      );
    }
  }, []);

  // Delete story
  const deleteStory = useCallback(
    async (storyId: string): Promise<boolean> => {
      const response = await StoryService.deleteStory(storyId);

      if (response.success) {
        // Remove from local state
        setUserStories((prevStories) =>
          prevStories
            .map((userStory) => ({
              ...userStory,
              stories: userStory.stories.filter(
                (story) => story.id !== storyId
              ),
            }))
            .filter((userStory) => userStory.stories.length > 0)
        );

        // If deleted current story, move to next
        if (currentStory?.id === storyId) {
          nextStory();
        }

        return true;
      } else {
        setError(response.error || "Erro ao deletar story");
        return false;
      }
    },
    [currentStory]
  );

  // Navigate to next story
  const nextStory = useCallback(() => {
    if (currentUserIndex === -1) return;

    const currentUser = userStories[currentUserIndex];
    if (!currentUser) return;

    const nextStoryIdx = currentStoryIndex + 1;

    // If there are more stories from this user
    if (nextStoryIdx < currentUser.stories.length) {
      setCurrentStoryIndex(nextStoryIdx);
      setCurrentStory(currentUser.stories[nextStoryIdx]);
    } else {
      // Move to next user's stories
      const nextUserIdx = currentUserIndex + 1;

      if (nextUserIdx < userStories.length) {
        setCurrentUserIndex(nextUserIdx);
        setCurrentStoryIndex(0);
        setCurrentStory(userStories[nextUserIdx].stories[0]);
      } else {
        // End of stories
        closeStoryViewer();
      }
    }
  }, [currentUserIndex, currentStoryIndex, userStories]);

  // Navigate to previous story
  const previousStory = useCallback(() => {
    if (currentUserIndex === -1) return;

    const prevStoryIdx = currentStoryIndex - 1;

    // If there are previous stories from this user
    if (prevStoryIdx >= 0) {
      setCurrentStoryIndex(prevStoryIdx);
      setCurrentStory(userStories[currentUserIndex].stories[prevStoryIdx]);
    } else {
      // Move to previous user's stories
      const prevUserIdx = currentUserIndex - 1;

      if (prevUserIdx >= 0) {
        const prevUser = userStories[prevUserIdx];
        const lastStoryIdx = prevUser.stories.length - 1;

        setCurrentUserIndex(prevUserIdx);
        setCurrentStoryIndex(lastStoryIdx);
        setCurrentStory(prevUser.stories[lastStoryIdx]);
      }
      // If already at first story, do nothing
    }
  }, [currentUserIndex, currentStoryIndex, userStories]);

  // Go to specific user's stories
  const goToUserStories = useCallback(
    (userIndex: number) => {
      if (userIndex >= 0 && userIndex < userStories.length) {
        const user = userStories[userIndex];

        if (user.stories.length > 0) {
          setCurrentUserIndex(userIndex);
          setCurrentStoryIndex(0);
          setCurrentStory(user.stories[0]);
        }
      }
    },
    [userStories]
  );

  // Close story viewer
  const closeStoryViewer = useCallback(() => {
    setCurrentUserIndex(-1);
    setCurrentStoryIndex(0);
    setCurrentStory(null);
  }, []);

  // Auto-mark story as viewed when opened
  useEffect(() => {
    if (currentStory && !currentStory.hasViewed) {
      viewStory(currentStory.id);
    }
  }, [currentStory, viewStory]);

  // Load stories on mount
  useEffect(() => {
    loadStories();
  }, [loadStories]);

  return {
    userStories,
    loading,
    error,
    currentStory,
    currentUserIndex,
    currentStoryIndex,
    loadStories,
    createStory,
    viewStory,
    deleteStory,
    nextStory,
    previousStory,
    goToUserStories,
    closeStoryViewer,
  };
}
