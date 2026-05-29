import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const version = new Date()
  .toISOString()
  .replace(/[-:T]/g, "")
  .slice(0, 14);

const data = {
  version,
};

const filePath = path.join(__dirname, "../public/version.json");

fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

