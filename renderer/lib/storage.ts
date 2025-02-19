import fs from "fs";
import path from "path";
import os from "os";

const STORAGE_DIR = path.join(os.tmpdir(), "pagen-storage");
console.log("STORAGE_DIR", STORAGE_DIR);

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export function storePage(id: string, pageTree: string) {
  const filePath = path.join(STORAGE_DIR, `${id}.json`);
  fs.writeFileSync(filePath, pageTree, "utf-8");
}

export function getPage(id: string): string | null {
  try {
    const filePath = path.join(STORAGE_DIR, `${id}.json`);
    const pageTree = fs.readFileSync(filePath, "utf-8");
    return pageTree;
  } catch (error) {
    return null;
  }
}
