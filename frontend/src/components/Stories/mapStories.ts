import { Story as ApiStory } from "../../types/stories.types";
import { UIStory, UIUserStories } from "./types";

/**
 * Maps domain stories to UI grouped stories by user
 */
export function mapStoriesToUIUserGroups(
  currentUserId: string,
  stories: ApiStory[]
): UIUserStories[] {
  const byUser = new Map<string, UIUserStories>();

  for (const s of stories) {
    const hasViewed = s.viewedBy?.includes(currentUserId) ?? false;
    const key = s.userId;

    const mapped: UIStory = {
      id: s.id,
      userId: s.userId,
      mediaUrl: s.imageUrl,
      mediaType: "image",
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      user: {
        id: s.userId,
        username: s.username,
        name: s.username,
        avatar: s.userAvatar,
      },
      viewCount: s.viewedBy?.length ?? 0,
      hasViewed,
    };

    const existing = byUser.get(key);
    if (existing) {
      existing.stories.push(mapped);
      existing.hasUnviewed = existing.hasUnviewed || !hasViewed;
    } else {
      byUser.set(key, {
        userId: s.userId,
        username: s.username,
        name: s.username,
        avatar: s.userAvatar,
        stories: [mapped],
        hasUnviewed: !hasViewed,
      });
    }
  }

  return Array.from(byUser.values());
}
