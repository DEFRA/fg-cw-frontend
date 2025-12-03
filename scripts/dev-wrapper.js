import { spawn } from "node:child_process";
import * as path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { DevContainers } from "./dev-containers.js";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(dirname, "..");

const containers = new DevContainers();
let appProcess = null;
let isShuttingDown = false;

const main = async () => {
  try {
    // Start containers and get environment variables
    const containerEnv = await containers.start();

    // Merge container env with existing process.env
    // Container env vars override .env file values
    const appEnv = {
      ...process.env,
      ...containerEnv,
    };

    console.log("🚀 Starting application...\n");

    // Spawn the application as child process with npm-run-all
    // This runs webpack watch and nodemon in parallel
    appProcess = spawn("npm", ["run-script", "dev:inner"], {
      cwd: rootDir,
      env: appEnv,
      stdio: "inherit",
    });

    appProcess.on("error", (error) => {
      console.error("Failed to start application:", error);
      process.exit(1);
    });

    appProcess.on("exit", async (code) => {
      if (isShuttingDown) return;

      if (code !== 0 && code !== null) {
        console.error(`\nApplication exited with code ${code}\n`);
      }

      await containers.stop();
      process.exit(code);
    });

    // Handle shutdown signals
    const shutdown = async (signal) => {
      if (isShuttingDown) return;
      isShuttingDown = true;

      console.log(`\n\n${signal} received, shutting down gracefully...\n`);

      if (appProcess) {
        appProcess.kill(signal);
      }

      await containers.stop();
      process.exit(0);
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
  } catch (error) {
    console.error("Failed to start:", error);
    process.exit(1);
  }
};

main();
