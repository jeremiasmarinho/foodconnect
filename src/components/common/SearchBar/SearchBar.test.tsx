import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SearchBar } from "../SearchBar";

describe("SearchBar Component", () => {
  const defaultProps = {
    value: "",
    onChangeText: jest.fn(),
    onSearch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with default props", () => {
    const { getByPlaceholderText } = render(<SearchBar {...defaultProps} />);

    expect(getByPlaceholderText("Pesquisar restaurantes...")).toBeTruthy();
  });

  it("displays the correct search value", () => {
    const { getByDisplayValue } = render(
      <SearchBar {...defaultProps} value="pizza" />
    );

    expect(getByDisplayValue("pizza")).toBeTruthy();
  });

  it("calls onChangeText when text is changed", () => {
    const mockOnChangeText = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar {...defaultProps} onChangeText={mockOnChangeText} />
    );

    const input = getByPlaceholderText("Pesquisar restaurantes...");
    fireEvent.changeText(input, "sushi");

    expect(mockOnChangeText).toHaveBeenCalledWith("sushi");
  });

  it("calls onSearch when search button is pressed", () => {
    const mockOnSearch = jest.fn();
    const { getByTestId } = render(
      <SearchBar {...defaultProps} onSearch={mockOnSearch} value="burger" />
    );

    const searchButton = getByTestId("search-button");
    fireEvent.press(searchButton);

    expect(mockOnSearch).toHaveBeenCalledWith("burger");
  });

  it("shows clear button when there is text", () => {
    const { getByTestId } = render(
      <SearchBar {...defaultProps} value="test" />
    );

    expect(getByTestId("clear-button")).toBeTruthy();
  });

  it("calls onChangeText with empty string when clear button is pressed", () => {
    const mockOnChangeText = jest.fn();
    const { getByTestId } = render(
      <SearchBar
        {...defaultProps}
        value="test"
        onChangeText={mockOnChangeText}
      />
    );

    const clearButton = getByTestId("clear-button");
    fireEvent.press(clearButton);

    expect(mockOnChangeText).toHaveBeenCalledWith("");
  });

  it("calls onSearch when return key is pressed", () => {
    const mockOnSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar {...defaultProps} onSearch={mockOnSearch} value="coffee" />
    );

    const input = getByPlaceholderText("Pesquisar restaurantes...");
    fireEvent(input, "submitEditing");

    expect(mockOnSearch).toHaveBeenCalledWith("coffee");
  });

  it("renders with custom placeholder", () => {
    const { getByPlaceholderText } = render(
      <SearchBar {...defaultProps} placeholder="Search for food..." />
    );

    expect(getByPlaceholderText("Search for food...")).toBeTruthy();
  });

  it("is disabled when disabled prop is true", () => {
    const { getByPlaceholderText } = render(
      <SearchBar {...defaultProps} disabled={true} />
    );

    const input = getByPlaceholderText("Pesquisar restaurantes...");
    expect(input.props.editable).toBe(false);
  });
});
