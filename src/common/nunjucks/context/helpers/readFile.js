import { readFileSync as nodeReadFileSync } from "node:fs";

export const readFileSync = (path, type) => nodeReadFileSync(path, type);
