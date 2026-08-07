import "dotenv/config";
import { scanDir } from "./src/scanner.js";
import path from "path";

const ROOT_DIR = process.env.ROOT_DIR || "./music";

await scanDir(path.resolve(ROOT_DIR));
console.log("Done!");
process.exit(0);