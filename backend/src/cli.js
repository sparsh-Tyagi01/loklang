#!/usr/bin/env node
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import readline from "readline";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseArgs() {
  const args = process.argv.slice(2);
  const parsed = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--root" || args[i] === "-r") parsed.root = args[++i];
    if (args[i] === "--port" || args[i] === "-p") parsed.port = args[++i];
  }
  return parsed;
}

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => {
    rl.close();
    resolve(answer.trim());
  }));
}

async function main() {
  const args = parseArgs();
  const configPath = path.join(process.cwd(), "loklang.config.json");

  let config = {};
  if (fs.existsSync(configPath)) {
    config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  }

  const rootDir = args.root || config.rootDir || (await ask("Enter your music folder path: "));
  const port = args.port || config.port || 8000;

  if (!fs.existsSync(rootDir)) {
    console.error(`Folder not found: ${rootDir}`);
    process.exit(1);
  }

  // Save config so next time it's not asked again
  fs.writeFileSync(configPath, JSON.stringify({ rootDir, port }, null, 2));

  process.env.ROOT_DIR = rootDir;
  process.env.PORT = String(port);
  process.env.DATABASE_URL = `file:${path.join(process.cwd(), "data", "loklang.db")}`;

  await import("./index.js");
}

main();