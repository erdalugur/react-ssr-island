import fs from 'fs/promises';

export async function fileExists(filePath: string) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function createDirectory(dirPath: string) {
  return fs.mkdir(dirPath, { recursive: true });
}

export async function ensureDirectoryExists(dirPath: string) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

export async function readFile(filePath: string) {
  return fs.readFile(filePath, { encoding: 'utf-8' });
}

export async function writeFile(filePath: string, data: string) {
  return fs.writeFile(filePath, data)
}
