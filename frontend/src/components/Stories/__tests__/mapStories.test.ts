import { mapStoriesToUIUserGroups } from "../mapStories";
import { Story as ApiStory } from "../../../types/stories.types";

describe("mapStoriesToUIUserGroups", () => {
  const currentUserId = "u1";

  const stories: ApiStory[] = [
    {
      id: "s1",
      userId: "u2",
      username: "alice",
      userAvatar: "http://x/y.jpg",
      imageUrl: "http://img/1.jpg",
      createdAt: "2025-01-01T00:00:00.000Z",
      expiresAt: "2025-01-02T00:00:00.000Z",
      viewedBy: [],
      isHighlighted: false,
    },
    {
      id: "s2",
      userId: "u2",
      username: "alice",
      userAvatar: undefined,
      imageUrl: "http://img/2.jpg",
      createdAt: "2025-01-01T00:01:00.000Z",
      expiresAt: "2025-01-02T00:01:00.000Z",
      viewedBy: ["u1"],
      isHighlighted: true,
    },
    {
      id: "s3",
      userId: "u3",
      username: "bob",
      userAvatar: undefined,
      imageUrl: "http://img/3.jpg",
      createdAt: "2025-01-01T00:02:00.000Z",
      expiresAt: "2025-01-02T00:02:00.000Z",
      viewedBy: [],
      isHighlighted: false,
    },
  ];

  it("groups stories by user and flags unviewed", () => {
    const groups = mapStoriesToUIUserGroups(currentUserId, stories);

    expect(groups.length).toBe(2);
    const alice = groups.find((g) => g.userId === "u2");
    const bob = groups.find((g) => g.userId === "u3");

    expect(alice).toBeTruthy();
    expect(bob).toBeTruthy();

    // Alice has 2 stories, one viewed, one not -> hasUnviewed true
    expect(alice!.stories.length).toBe(2);
    expect(alice!.hasUnviewed).toBe(true);

    // Bob has 1 story, not viewed -> hasUnviewed true
    expect(bob!.stories.length).toBe(1);
    expect(bob!.hasUnviewed).toBe(true);

    // Mapped shape includes mediaUrl and hasViewed
    const s1 = alice!.stories.find((s) => s.id === "s1");
    const s2 = alice!.stories.find((s) => s.id === "s2");
    expect(s1!.mediaUrl).toBe("http://img/1.jpg");
    expect(s1!.hasViewed).toBe(false);
    expect(s2!.hasViewed).toBe(true);
  });
});
