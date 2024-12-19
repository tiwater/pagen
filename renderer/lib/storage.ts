import fs from "fs";
import path from "path";
import os from "os";

const STORAGE_DIR = path.join(os.tmpdir(), "pagen-storage");

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export function storePage(id: string, code: string) {
  const filePath = path.join(STORAGE_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify({ code }), "utf-8");
}

export function getPage(id: string): string | null {
  try {
    const filePath = path.join(STORAGE_DIR, `${id}.json`);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return data.code;
  } catch (error) {
    return null;
  }
}
