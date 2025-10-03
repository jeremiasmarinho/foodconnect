import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Input } from "../Input";

describe("Input Component", () => {
  const defaultProps = {
    placeholder: "Test placeholder",
    value: "",
    onChangeText: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    const { getByPlaceholderText } = render(<Input {...defaultProps} />);

    expect(getByPlaceholderText("Test placeholder")).toBeTruthy();
  });

  it("displays the correct value", () => {
    const { getByDisplayValue } = render(
      <Input {...defaultProps} value="test value" />
    );

    expect(getByDisplayValue("test value")).toBeTruthy();
  });

  it("calls onChangeText when text is changed", () => {
    const mockOnChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <Input {...defaultProps} onChangeText={mockOnChangeText} />
    );

    const input = getByPlaceholderText("Test placeholder");
    fireEvent.changeText(input, "new text");

    expect(mockOnChangeText).toHaveBeenCalledWith("new text");
  });

  it("shows error state when error prop is provided", () => {
    const { getByText } = render(
      <Input {...defaultProps} error="This field is required" />
    );

    expect(getByText("This field is required")).toBeTruthy();
  });

  it("applies secure text entry when secureTextEntry is true", () => {
    const { getByPlaceholderText } = render(
      <Input {...defaultProps} secureTextEntry={true} />
    );

    const input = getByPlaceholderText("Test placeholder");
    expect(input.props.secureTextEntry).toBe(true);
  });

  it("renders with icon when icon prop is provided", () => {
    const { getByTestId } = render(<Input {...defaultProps} icon="person" />);

    expect(getByTestId("input-icon")).toBeTruthy();
  });

  it("is disabled when disabled prop is true", () => {
    const { getByPlaceholderText } = render(
      <Input {...defaultProps} disabled={true} />
    );

    const input = getByPlaceholderText("Test placeholder");
    expect(input.props.editable).toBe(false);
  });

  it("handles focus and blur events", () => {
    const mockOnFocus = jest.fn();
    const mockOnBlur = jest.fn();

    const { getByPlaceholderText } = render(
      <Input {...defaultProps} onFocus={mockOnFocus} onBlur={mockOnBlur} />
    );

    const input = getByPlaceholderText("Test placeholder");

    fireEvent(input, "focus");
    expect(mockOnFocus).toHaveBeenCalled();

    fireEvent(input, "blur");
    expect(mockOnBlur).toHaveBeenCalled();
  });
});
