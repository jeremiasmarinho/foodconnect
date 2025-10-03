import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "../Button";

// Mock do provider de tema
const mockUseTheme = {
  colors: {
    primary: "#FF6347",
    background: "#FFFFFF",
    text: "#000000",
    textSecondary: "#666666",
    border: "#E0E0E0",
    surface: "#F5F5F5",
    success: "#4CAF50",
    warning: "#FF9800",
    error: "#F44336",
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
    h3: { fontSize: 20, fontWeight: "600" },
    body: { fontSize: 16 },
    caption: { fontSize: 14 },
  },
};

jest.mock("../../providers", () => ({
  useTheme: () => mockUseTheme,
}));

describe("Button Component", () => {
  const defaultProps = {
    title: "Test Button",
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    const { getByText } = render(<Button {...defaultProps} />);

    expect(getByText("Test Button")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button {...defaultProps} onPress={mockOnPress} />
    );

    const button = getByText("Test Button");
    fireEvent.press(button);

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button {...defaultProps} onPress={mockOnPress} disabled={true} />
    );

    const button = getByText("Test Button");
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it("shows loading indicator when loading", () => {
    const { getByTestId, queryByText } = render(
      <Button {...defaultProps} loading={true} />
    );

    expect(getByTestId("button-loading")).toBeTruthy();
    expect(queryByText("Test Button")).toBeNull();
  });

  it("does not call onPress when loading", () => {
    const mockOnPress = jest.fn();
    const { getByRole } = render(
      <Button {...defaultProps} onPress={mockOnPress} loading={true} />
    );

    const button = getByRole("button");
    fireEvent.press(button);

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it("renders with primary variant styling", () => {
    const { getByRole } = render(
      <Button {...defaultProps} variant="primary" />
    );

    const button = getByRole("button");
    expect(button.props.style).toMatchObject(
      expect.objectContaining({
        backgroundColor: mockUseTheme.colors.primary,
      })
    );
  });

  it("renders with secondary variant styling", () => {
    const { getByRole } = render(
      <Button {...defaultProps} variant="secondary" />
    );

    const button = getByRole("button");
    expect(button.props.style).toMatchObject(
      expect.objectContaining({
        backgroundColor: mockUseTheme.colors.surface,
      })
    );
  });

  it("renders with outline variant styling", () => {
    const { getByRole } = render(
      <Button {...defaultProps} variant="outline" />
    );

    const button = getByRole("button");
    expect(button.props.style).toMatchObject(
      expect.objectContaining({
        borderColor: mockUseTheme.colors.primary,
        borderWidth: 1,
      })
    );
  });

  it("renders with different sizes", () => {
    const { rerender, getByRole } = render(
      <Button {...defaultProps} size="small" />
    );

    let button = getByRole("button");
    expect(button.props.style.paddingVertical).toBeLessThan(16);

    rerender(<Button {...defaultProps} size="large" />);
    button = getByRole("button");
    expect(button.props.style.paddingVertical).toBeGreaterThan(16);
  });

  it("renders full width when fullWidth is true", () => {
    const { getByRole } = render(<Button {...defaultProps} fullWidth={true} />);

    const button = getByRole("button");
    expect(button.props.style).toMatchObject(
      expect.objectContaining({
        width: "100%",
      })
    );
  });

  it("applies custom styles", () => {
    const customStyle = { marginTop: 20 };
    const customTextStyle = { fontSize: 18 };

    const { getByRole, getByText } = render(
      <Button
        {...defaultProps}
        style={customStyle}
        textStyle={customTextStyle}
      />
    );

    const button = getByRole("button");
    const text = getByText("Test Button");

    expect(button.props.style).toMatchObject(
      expect.objectContaining(customStyle)
    );
    expect(text.props.style).toMatchObject(
      expect.objectContaining(customTextStyle)
    );
  });
});
