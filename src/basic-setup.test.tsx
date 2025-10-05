import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

// Teste básico para verificar se a configuração está funcionando
describe("Basic React Native Testing Setup", () => {
  test("should render basic React Native component", () => {
    const TestComponent = () => <Text testID="hello">Hello World</Text>;

    render(<TestComponent />);

    expect(screen.getByTestId("hello")).toHaveTextContent("Hello World");
  });

  test("should work with async operations", async () => {
    const AsyncComponent = () => {
      const [text, setText] = React.useState("Loading...");

      React.useEffect(() => {
        setTimeout(() => setText("Loaded!"), 100);
      }, []);

      return <Text testID="async-text">{text}</Text>;
    };

    render(<AsyncComponent />);

    expect(screen.getByTestId("async-text")).toHaveTextContent("Loading...");

    // Wait for async update
    await screen.findByText("Loaded!");
    expect(screen.getByTestId("async-text")).toHaveTextContent("Loaded!");
  });
});
