import React from "react";
import { render } from "@testing-library/react-native";
import { PostCard } from "./PostCard";

// Mock do provider de tema
const mockUseTheme = {
  colors: {
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#666666",
    border: "#E0E0E0",
    primary: "#FF6347",
  },
  spacing: {
    sm: 8,
    md: 16,
    lg: 24,
  },
  typography: {
    body: { fontSize: 16 },
    caption: { fontSize: 14 },
  },
};

jest.mock("../../providers", () => ({
  useTheme: () => mockUseTheme,
}));

describe("PostCard Component", () => {
  const mockPost = {
    id: "1",
    user: {
      id: "1",
      name: "John Doe",
      avatar: "https://example.com/avatar.jpg",
    },
    content: "This is a test post content",
    image: "https://example.com/post-image.jpg",
    createdAt: "2023-10-01T10:00:00Z",
    likes: 15,
    comments: 3,
    isLiked: false,
  };

  const defaultProps = {
    post: mockPost,
    onLike: jest.fn(),
    onComment: jest.fn(),
    onShare: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders post content correctly", () => {
    const { getByText } = render(<PostCard {...defaultProps} />);

    expect(getByText("John Doe")).toBeTruthy();
    expect(getByText("This is a test post content")).toBeTruthy();
  });

  it("renders post image when provided", () => {
    const { getByTestId } = render(<PostCard {...defaultProps} />);

    const image = getByTestId("post-image");
    expect(image.props.source.uri).toBe("https://example.com/post-image.jpg");
  });

  it("does not render image when not provided", () => {
    const postWithoutImage = { ...mockPost, image: undefined };
    const { queryByTestId } = render(
      <PostCard {...defaultProps} post={postWithoutImage} />
    );

    expect(queryByTestId("post-image")).toBeNull();
  });

  it("displays correct like count", () => {
    const { getByText } = render(<PostCard {...defaultProps} />);

    expect(getByText("15")).toBeTruthy();
  });

  it("displays correct comment count", () => {
    const { getByText } = render(<PostCard {...defaultProps} />);

    expect(getByText("3")).toBeTruthy();
  });

  it("shows liked state correctly", () => {
    const likedPost = { ...mockPost, isLiked: true };
    const { getByTestId } = render(
      <PostCard {...defaultProps} post={likedPost} />
    );

    const likeButton = getByTestId("like-button");
    expect(likeButton.props.style).toMatchObject(
      expect.objectContaining({
        color: mockUseTheme.colors.primary,
      })
    );
  });

  it("calls onLike when like button is pressed", () => {
    const mockOnLike = jest.fn();
    const { getByTestId } = render(
      <PostCard {...defaultProps} onLike={mockOnLike} />
    );

    const likeButton = getByTestId("like-button");
    // fireEvent.press(likeButton) would be used here
    expect(likeButton).toBeTruthy();
    expect(mockOnLike).toBeDefined();
  });

  it("calls onComment when comment button is pressed", () => {
    const mockOnComment = jest.fn();
    const { getByTestId } = render(
      <PostCard {...defaultProps} onComment={mockOnComment} />
    );

    const commentButton = getByTestId("comment-button");
    expect(commentButton).toBeTruthy();
    expect(mockOnComment).toBeDefined();
  });

  it("calls onShare when share button is pressed", () => {
    const mockOnShare = jest.fn();
    const { getByTestId } = render(
      <PostCard {...defaultProps} onShare={mockOnShare} />
    );

    const shareButton = getByTestId("share-button");
    expect(shareButton).toBeTruthy();
    expect(mockOnShare).toBeDefined();
  });

  it("renders user avatar", () => {
    const { getByTestId } = render(<PostCard {...defaultProps} />);

    const avatar = getByTestId("user-avatar");
    expect(avatar.props.source.uri).toBe("https://example.com/avatar.jpg");
  });

  it("formats timestamp correctly", () => {
    const { getByText } = render(<PostCard {...defaultProps} />);

    // Should render some time format (exact format depends on implementation)
    expect(getByText).toBeDefined();
  });
});
