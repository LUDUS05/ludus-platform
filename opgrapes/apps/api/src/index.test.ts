import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "./app";

describe("api", () => {
  it("health is ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("creates item", async () => {
    const res = await request(app).post("/items").send({ name: "Test" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 2, name: "Test" });
  });

  it("validates item payload", async () => {
    const res = await request(app).post("/items").send({ name: "" });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("ValidationError");
  });
});


