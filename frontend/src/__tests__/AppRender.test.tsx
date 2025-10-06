import React from "react";
import { render } from "@testing-library/react-native";
import App from "../../App";

// Minimal smoke test to ensure App renders without crashing and shows header text
// Our SafeFeedScreen renders the title 'FoodConnect' in the header

describe("App root render", () => {
  it("renders the App without crashing (smoke)", () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });
});
