import { mkdir, rename, rm } from 'node:fs/promises';
import { join } from 'node:path';

const distDir = new URL('../dist', import.meta.url);
const legacy404 = join(distDir.pathname, '404.html');
const targetDir = join(distDir.pathname, '404');
const targetFile = join(targetDir, 'index.html');

await mkdir(targetDir, { recursive: true });
await rename(legacy404, targetFile);
