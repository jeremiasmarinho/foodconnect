import React from "react";
import { render } from "@testing-library/react-native";
import { Loading } from "./Loading";

// Mock do provider de tema
const mockUseTheme = {
  colors: {
    primary: "#FF6347",
    background: "#FFFFFF",
    text: "#000000",
  },
  spacing: {
    md: 16,
    lg: 24,
  },
};

jest.mock("../../providers", () => ({
  useTheme: () => mockUseTheme,
}));

describe("Loading Component", () => {
  it("renders loading indicator", () => {
    const { getByTestId } = render(<Loading />);

    expect(getByTestId("loading-indicator")).toBeTruthy();
  });

  it("shows loading text when provided", () => {
    const { getByText } = render(<Loading text="Carregando..." />);

    expect(getByText("Carregando...")).toBeTruthy();
  });

  it("does not show text by default", () => {
    const { queryByText } = render(<Loading />);

    expect(queryByText("Carregando...")).toBeNull();
  });

  it("renders with different sizes", () => {
    const { rerender, getByTestId } = render(<Loading size="small" />);

    let indicator = getByTestId("loading-indicator");
    expect(indicator.props.size).toBe("small");

    rerender(<Loading size="large" />);
    indicator = getByTestId("loading-indicator");
    expect(indicator.props.size).toBe("large");
  });

  it("applies custom color", () => {
    const customColor = "#123456";
    const { getByTestId } = render(<Loading color={customColor} />);

    const indicator = getByTestId("loading-indicator");
    expect(indicator.props.color).toBe(customColor);
  });

  it("uses theme primary color by default", () => {
    const { getByTestId } = render(<Loading />);

    const indicator = getByTestId("loading-indicator");
    expect(indicator.props.color).toBe(mockUseTheme.colors.primary);
  });
});
