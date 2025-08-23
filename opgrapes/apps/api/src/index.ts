import { app } from "./app.js";

const port = process.env.PORT ?? 5000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`🚀 API server running on port ${port}`);
  console.log(`📡 API available at: http://localhost:${port}`);
  console.log(`🔍 Health check: http://localhost:${port}/api/health`);
});


