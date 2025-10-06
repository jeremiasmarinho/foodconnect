import { useState, useEffect } from "react";
import { storiesService } from "../services/stories.service";
import { Story } from "../types/stories.types";

/**
 * Hook para gerenciar o estado dos Stories
 * Segue padrões do FoodConnect: Custom Hooks para lógica de negócio
 */
export const useStoriesController = (currentUserId: string) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [viewingStory, setViewingStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega stories do usuário e amigos
  const loadStories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storiesService.getStoriesForUser(currentUserId);
      setStories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar stories");
      console.error("Error loading stories:", err);
    } finally {
      setLoading(false);
    }
  };

  // Abre story para visualização
  const viewStory = (story: Story) => {
    setViewingStory(story);
  };

  // Fecha o visualizador
  const closeStoryViewer = () => {
    setViewingStory(null);
  };

  // Marca story como visualizada
  const markAsViewed = async (storyId: string) => {
    try {
      await storiesService.markStoryAsViewed(storyId, currentUserId);
      // Atualiza estado local
      setStories((prev) =>
        prev.map((story) =>
          story.id === storyId
            ? { ...story, viewedBy: [...story.viewedBy, currentUserId] }
            : story
        )
      );
    } catch (err) {
      console.error("Error marking story as viewed:", err);
    }
  };

  // Recarrega stories
  const refreshStories = () => {
    loadStories();
  };

  // Carrega stories na inicialização
  useEffect(() => {
    if (currentUserId) {
      loadStories();
    }
  }, [currentUserId]);

  return {
    stories,
    viewingStory,
    loading,
    error,
    viewStory,
    closeStoryViewer,
    markAsViewed,
    refreshStories,
  };
};
