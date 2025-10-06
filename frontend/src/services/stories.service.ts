import { storiesApi } from "./api";
import {
  Story,
  CreateStoryRequest,
  StoryMetrics,
} from "../types/stories.types";

/**
 * Serviço para gerenciar Stories
 * Segue padrões do FoodConnect: Services para comunicação com API
 */
class StoriesService {
  /**
   * Busca stories do usuário e de quem ele segue
   */
  async getStoriesForUser(userId: string): Promise<Story[]> {
    try {
      return await storiesApi.getStoriesForUser(userId);
    } catch (error) {
      console.error("Error fetching stories:", error);
      return [];
    }
  }

  /**
   * Busca stories específicos de um usuário
   */
  async getUserStories(userId: string): Promise<Story[]> {
    try {
      return await storiesApi.getUserStories(userId);
    } catch (error) {
      console.error("Error fetching user stories:", error);
      return [];
    }
  }

  /**
   * Cria um novo story
   */
  async createStory(storyData: CreateStoryRequest): Promise<Story> {
    return await storiesApi.createStory(storyData);
  }

  /**
   * Marca story como visualizado
   */
  async markStoryAsViewed(storyId: string, userId: string): Promise<void> {
    await storiesApi.markStoryAsViewed(storyId, { userId });
  }

  /**
   * Busca métricas de um story
   */
  async getStoryMetrics(storyId: string): Promise<StoryMetrics> {
    return await storiesApi.getStoryMetrics(storyId);
  }

  /**
   * Deleta um story
   */
  async deleteStory(storyId: string): Promise<void> {
    await storiesApi.deleteStory(storyId);
  }

  /**
   * Destaca/remove destaque de um story
   */
  async toggleHighlight(storyId: string, highlighted: boolean): Promise<Story> {
    return await storiesApi.toggleHighlight(storyId, {
      isHighlighted: highlighted,
    });
  }
}

export const storiesService = new StoriesService();
