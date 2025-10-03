import React from "react";
import { render } from "@testing-library/react-native";
import { Header } from "../Header";

// Mock do provider de tema
const mockUseTheme = {
  colors: {
    primary: "#FF6347",
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#666666",
    border: "#E0E0E0",
    surface: "#F5F5F5",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    h1: { fontSize: 32, fontWeight: "bold" },
    h2: { fontSize: 24, fontWeight: "bold" },
    body: { fontSize: 16 },
  },
};

jest.mock("../../providers", () => ({
  useTheme: () => mockUseTheme,
}));

// Mock do react-navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: jest.fn(),
  }),
}));

describe("Header Component", () => {
  it("renders title correctly", () => {
    const { getByText } = render(<Header title="Test Header" />);

    expect(getByText("Test Header")).toBeTruthy();
  });

  it("shows back button when showBack is true", () => {
    const { getByTestId } = render(
      <Header title="Test Header" showBack={true} />
    );

    expect(getByTestId("header-back-button")).toBeTruthy();
  });

  it("does not show back button by default", () => {
    const { queryByTestId } = render(<Header title="Test Header" />);

    expect(queryByTestId("header-back-button")).toBeNull();
  });

  it("renders right action when provided", () => {
    const RightAction = () => <div testID="right-action">Action</div>;

    const { getByTestId } = render(
      <Header title="Test Header" rightAction={<RightAction />} />
    );

    expect(getByTestId("right-action")).toBeTruthy();
  });

  it("applies custom styles", () => {
    const customStyle = { backgroundColor: "#000" };

    const { getByTestId } = render(
      <Header title="Test Header" style={customStyle} />
    );

    const header = getByTestId("header-container");
    expect(header.props.style).toMatchObject(
      expect.objectContaining(customStyle)
    );
  });
});
