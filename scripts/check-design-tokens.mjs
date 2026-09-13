#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

let hasError = false;

function error(msg) {
  console.error(`\x1b[31m[ERROR]\x1b[0m ${msg}`);
  hasError = true;
}

function success(msg) {
  console.log(`\x1b[32m[PASS]\x1b[0m ${msg}`);
}

console.log('\n🔍 Running Autoprime Design System Guardrails...\n');

// 1. Verify byte-identical tokens between packages/design-system and .agent/skills/autoprime-design/assets
const filesToCompare = [
  ['packages/design-system/src/tokens.css', '.agent/skills/autoprime-design/assets/tokens.css'],
  ['packages/design-system/src/tokens.ts', '.agent/skills/autoprime-design/assets/tokens.ts'],
];

for (const [fileA, fileB] of filesToCompare) {
  const pathA = path.join(rootDir, fileA);
  const pathB = path.join(rootDir, fileB);

  if (!fs.existsSync(pathA) || !fs.existsSync(pathB)) {
    error(`Missing token file for comparison: ${fileA} or ${fileB}`);
    continue;
  }

  const contentA = fs.readFileSync(pathA);
  const contentB = fs.readFileSync(pathB);

  if (Buffer.compare(contentA, contentB) !== 0) {
    error(`Token files are NOT byte-identical:\n  ${fileA}\n  ${fileB}\nEnsure both copies are synchronized!`);
  } else {
    success(`Token files are synchronized and byte-identical: ${path.basename(fileA)}`);
  }
}

// 2. Helper to recursively find files with given extensions
function getFiles(dir, extensions, ignoreDirs = ['node_modules', '.git', 'dist', 'build', '.turbo']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const dirent of list) {
    const fullPath = path.join(dir, dirent.name);
    if (dirent.isDirectory()) {
      if (!ignoreDirs.includes(dirent.name)) {
        results = results.concat(getFiles(fullPath, extensions, ignoreDirs));
      }
    } else if (extensions.some(ext => dirent.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

// 3. Scan for raw hex literals in component code (Rule R1)
const uiFiles = [
  ...getFiles(path.join(rootDir, 'apps/web/src'), ['.tsx', '.css']),
  ...getFiles(path.join(rootDir, 'packages/ui/src'), ['.tsx', '.css']),
].filter(f => {
  const norm = f.replace(/\\/g, '/');
  // Allow root token definition files and OEM brand config constants
  return !norm.includes('packages/design-system') &&
         !norm.includes('apps/web/src/index.css') &&
         !norm.includes('apps/web/src/context/AuthContext.tsx');
});

const HEX_REGEX = /#[0-9a-fA-F]{3,8}\b/g;
let rawHexCount = 0;

for (const file of uiFiles) {
  const relPath = path.relative(rootDir, file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Skip comments
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;
    const matches = line.match(HEX_REGEX);
    if (matches) {
      error(`Raw hex ${matches.join(', ')} found in ${relPath}:${idx + 1}\n  --> ${trimmed}`);
      rawHexCount++;
    }
  });
}

if (rawHexCount === 0) {
  success('No raw hex color literals found in feature UI code');
}

// 4. Scan for box-shadow outside tokens in css files
const cssFiles = [
  ...getFiles(path.join(rootDir, 'apps'), ['.css']),
  ...getFiles(path.join(rootDir, 'packages/ui'), ['.css']),
].filter(f => !f.replace(/\\/g, '/').includes('packages/design-system'));

let shadowCount = 0;
for (const file of cssFiles) {
  const relPath = path.relative(rootDir, file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    if (line.includes('box-shadow')) {
      if (!line.includes('var(--shadow-') && !line.includes('var(--focus-ring)') && !line.includes('none')) {
        error(`Illegal box-shadow found in ${relPath}:${idx + 1}\n  --> ${line.trim()}`);
        shadowCount++;
      }
    }
  });
}

if (shadowCount === 0) {
  success('No box-shadow violations found (borders separate, shadows elevate)');
}

// 5. Scan for font-size literals in css files
let fontSizeCount = 0;
for (const file of cssFiles) {
  const relPath = path.relative(rootDir, file);
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    if (/font-size:\s*[0-9]/i.test(line)) {
      error(`Illegal font-size literal found in ${relPath}:${idx + 1}\n  --> ${line.trim()}`);
      fontSizeCount++;
    }
  });
}

if (fontSizeCount === 0) {
  success('No font-size literal violations found (using design tokens)');
}

console.log('');
if (hasError) {
  console.error('❌ Autoprime Design Guardrails FAILED. Review errors above.\n');
  process.exit(1);
} else {
  console.log('✅ All Autoprime Design Guardrails PASSED cleanly.\n');
  process.exit(0);
}
