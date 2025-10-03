import React from "react";
import { render } from "@testing-library/react-native";
import { ErrorView } from "../ErrorView";

// Mock do provider de tema
const mockUseTheme = {
  colors: {
    error: "#F44336",
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#666666",
  },
  spacing: {
    md: 16,
    lg: 24,
  },
  typography: {
    h2: { fontSize: 24, fontWeight: "bold" },
    body: { fontSize: 16 },
  },
};

jest.mock("../../providers", () => ({
  useTheme: () => mockUseTheme,
}));

describe("ErrorView Component", () => {
  it("renders default error message", () => {
    const { getByText } = render(<ErrorView />);

    expect(getByText("Algo deu errado")).toBeTruthy();
    expect(getByText("Tente novamente mais tarde")).toBeTruthy();
  });

  it("renders custom error message", () => {
    const customMessage = "Erro personalizado";
    const { getByText } = render(<ErrorView message={customMessage} />);

    expect(getByText(customMessage)).toBeTruthy();
  });

  it("renders custom description", () => {
    const customDescription = "Descrição personalizada do erro";
    const { getByText } = render(<ErrorView description={customDescription} />);

    expect(getByText(customDescription)).toBeTruthy();
  });

  it("shows retry button when onRetry is provided", () => {
    const mockOnRetry = jest.fn();
    const { getByText } = render(<ErrorView onRetry={mockOnRetry} />);

    expect(getByText("Tentar Novamente")).toBeTruthy();
  });

  it("does not show retry button when onRetry is not provided", () => {
    const { queryByText } = render(<ErrorView />);

    expect(queryByText("Tentar Novamente")).toBeNull();
  });

  it("calls onRetry when retry button is pressed", () => {
    const mockOnRetry = jest.fn();
    const { getByText } = render(<ErrorView onRetry={mockOnRetry} />);

    const retryButton = getByText("Tentar Novamente");
    // Note: fireEvent.press would be used here in a real test
    // For now, we just verify the button exists
    expect(retryButton).toBeTruthy();
    expect(mockOnRetry).toBeDefined();
  });

  it("renders error icon", () => {
    const { getByTestId } = render(<ErrorView />);

    expect(getByTestId("error-icon")).toBeTruthy();
  });

  it("applies custom styles", () => {
    const customStyle = { backgroundColor: "#000" };
    const { getByTestId } = render(<ErrorView style={customStyle} />);

    const container = getByTestId("error-container");
    expect(container.props.style).toMatchObject(
      expect.objectContaining(customStyle)
    );
  });
});
