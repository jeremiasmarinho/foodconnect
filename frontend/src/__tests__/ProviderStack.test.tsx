import React from "react";
import { render } from "@testing-library/react-native";
import App from "../../App";

// Integration smoke test for the full provider composition in App
describe("ProviderStack integration", () => {
  it("mounts the full App provider tree without throwing", () => {
    const { toJSON } = render(<App />);
    expect(toJSON()).toBeTruthy();
  });
});
