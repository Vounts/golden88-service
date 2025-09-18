import { loadEnv } from "./config/env.js";
import { createPool, closePool } from "./config/database.js";
import { createApp } from "./app.js";

async function start() {
  try {
    // Load environment variables
    const env = loadEnv();

    // Initialize database connection
    createPool();

    // Create and start the app
    const app = await createApp();

    await app.listen({
      port: env.PORT,
      host: env.HOST,
    });

    app.log.info(`Server listening on ${env.HOST}:${env.PORT}`);
    app.log.info(`Environment: ${env.NODE_ENV}`);

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      app.log.info(`Received ${signal}, shutting down gracefully`);

      try {
        await app.close();
        await closePool();
        process.exit(0);
      } catch (error: any) {
        app.log.error("Error during shutdown:", error);
        process.exit(1);
      }
    };

    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();
