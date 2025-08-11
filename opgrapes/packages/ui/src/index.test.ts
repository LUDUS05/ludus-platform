import { describe, it, expect } from "vitest";
import { hello } from "./index";

describe("ui package", () => {
  it("hello returns hello", () => {
    expect(hello()).toBe("hello");
  });
});


