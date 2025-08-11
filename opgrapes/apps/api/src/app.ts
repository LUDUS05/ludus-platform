import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { z } from "zod";
import routes from "./routes";

export const app = express();

app.use(cors());
app.use(express.json());

// Simple request logging
app.use((req, _res, next) => {
  // eslint-disable-next-line no-console
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Use LUDUS API routes
app.use("/api", routes);

// Legacy endpoints (keeping for backward compatibility)
app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/version", (_req, res) => {
  res.json({ version: "1.0.0", buildTime: new Date().toISOString() });
});

app.get("/items", (_req, res) => {
  res.json([{ id: 1, name: "Example" }]);
});

const itemSchema = z.object({ name: z.string().min(1) });

app.post("/items", (req, res, next) => {
  try {
    const data = itemSchema.parse(req.body);
    res.status(201).json({ id: 2, ...data });
  } catch (err) {
    next(err);
  }
});

// Error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);
  if (err instanceof z.ZodError) {
    return res.status(400).json({ error: "ValidationError", details: err.issues });
  }
  return res.status(500).json({ error: "InternalServerError" });
});


