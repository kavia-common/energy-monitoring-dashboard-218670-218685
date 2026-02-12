import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders login screen by default", () => {
  render(<App />);
  const title = screen.getByText(/access console/i);
  expect(title).toBeInTheDocument();
});
