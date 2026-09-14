import { spawn } from "node:child_process";

process.env.HEADPLANE_CONFIG_PATH = "./config.dev.yaml";
process.env.HEADPLANE_DEV_MOCK = "true";

const isWindows = process.platform === "win32";
const cmd = isWindows ? "pnpm.cmd" : "pnpm";

console.log("🚀 Starting Headplane in Dev Mock Mode...");
console.log("📦 Config: ./config.dev.yaml");
console.log("🧪 Mock Mode: enabled (Headscale check bypassed)");

const child = spawn(cmd, ["exec", "react-router", "dev"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
