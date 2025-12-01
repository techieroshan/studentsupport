#!/usr/bin/env node

/**
 * WCAG 2.2 AA Color Contrast Audit Script
 *
 * This script scans the actual codebase for Tailwind text/background
 * utility class combinations (e.g. `text-slate-700` on `bg-slate-50`)
 * and checks them against WCAG 2.2 AA contrast requirements:
 * - Normal text: 4.5:1 minimum
 * - Large text (18pt+ or 14pt+ bold): 3:1 minimum
 * - UI components: 3:1 minimum
 *
 * This avoids maintaining a hard-coded list of color pairs and
 * instead reflects what is really used in components/ and src/.
 */

import fs from 'fs';
import path from 'path';

// Tailwind color palette from tailwind.config.js (keep in sync manually)
const colors = {
  brand: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  emerald: {
    50: '#ecfdf5',
    100: '#d1fae5',
    600: '#059669',
    700: '#047857',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  white: '#ffffff',
  black: '#000000',
};

// Convert hex to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// Calculate relative luminance
function getLuminance(rgb) {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Calculate contrast ratio
function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(hexToRgb(color1));
  const lum2 = getLuminance(hexToRgb(color2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Check if contrast meets WCAG AA standards
function checkContrast(foreground, background, isLargeText = false) {
  const ratio = getContrastRatio(foreground, background);
  const minRatio = isLargeText ? 3 : 4.5;
  const passes = ratio >= minRatio;
  return { ratio, passes, minRatio };
}

// Utility: recursively walk a directory and return a list of files matching extensions
function walk(dir, exts, collected = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip node_modules and dist
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') continue;
      walk(full, exts, collected);
    } else {
      if (exts.includes(path.extname(entry.name))) {
        collected.push(full);
      }
    }
  }
  return collected;
}

// Map Tailwind utility name (e.g. "brand-600") to hex color
function resolveTailwindColor(token) {
  // token like "brand-600" or "slate-50"
  const [family, shadeStr] = token.split('-');
  const shade = Number(shadeStr);
  const familyColors = colors[family];
  if (!familyColors) return null;
  const hex = familyColors[shade];
  return hex ?? null;
}

// Extract text-*/bg-* combos actually used on the same line
function collectCombosFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const combos = [];

  const textRegex = /text-(brand|slate|emerald)-(50|100|200|300|400|500|600|700|800|900)/g;
  const bgRegex = /bg-(brand|slate|emerald)-(50|100|200|300|400|500|600|700|800|900)/g;

  lines.forEach((line, idx) => {
    const textMatches = Array.from(line.matchAll(textRegex));
    const bgMatches = Array.from(line.matchAll(bgRegex));
    if (!textMatches.length || !bgMatches.length) return;

    const texts = textMatches.map((m) => `${m[1]}-${m[2]}`);
    const bgs = bgMatches.map((m) => `${m[1]}-${m[2]}`);

    texts.forEach((t) => {
      bgs.forEach((b) => {
        combos.push({
          textToken: t,
          bgToken: b,
          context: `${t} on ${b} (${path.relative(process.cwd(), filePath)}:${idx + 1})`,
        });
      });
    });
  });

  return combos;
}

console.log('WCAG 2.2 AA Color Contrast Audit\n');
console.log('='.repeat(60));
console.log('Minimum Requirements:');
console.log('  - Normal text: 4.5:1');
console.log('  - Large text (18pt+ or 14pt+ bold): 3:1');
console.log('  - UI components: 3:1');
console.log('='.repeat(60));
console.log('');

const failures = [];
const passes = [];

// 1. Collect files and Tailwind text/bg combos actually used
const projectRoot = process.cwd();
const exts = ['.tsx', '.ts', '.jsx', '.js', '.css'];
const rootsToScan = ['src', 'components', 'App.tsx', 'index.tsx'].map((p) =>
  path.join(projectRoot, p),
);

const allFiles = rootsToScan
  .filter((p) => fs.existsSync(p))
  .flatMap((p) => {
    const stat = fs.statSync(p);
    if (stat.isDirectory()) return walk(p, exts);
    return [p];
  });

const comboMap = new Map(); // key: "text-token|bg-token", value: { textToken, bgToken, contexts: [] }

allFiles.forEach((filePath) => {
  const combos = collectCombosFromFile(filePath);
  combos.forEach(({ textToken, bgToken, context }) => {
    const key = `${textToken}|${bgToken}`;
    const existing = comboMap.get(key) ?? { textToken, bgToken, contexts: [] };
    existing.contexts.push(context);
    comboMap.set(key, existing);
  });
});

if (comboMap.size === 0) {
  console.log('No Tailwind text-/bg- combinations found to audit.');
} else {
  comboMap.forEach(({ textToken, bgToken, contexts }) => {
    const fgHex = textToken === 'white' ? colors.white : resolveTailwindColor(textToken);
    const bgHex = bgToken === 'white' ? colors.white : resolveTailwindColor(bgToken);

    if (!fgHex || !bgHex) {
      // Skip colors we don't know how to resolve
      return;
    }

    const { ratio, passes: passesCheck, minRatio } = checkContrast(fgHex, bgHex, false);
    const ratioStr = ratio.toFixed(2);
    const contextLabel = `${textToken} on ${bgToken}`;

    const result = {
      context: contextLabel,
      foreground: fgHex,
      background: bgHex,
      ratio: ratioStr,
      minRatio,
      passes: passesCheck,
      isLarge: false,
      examples: contexts.slice(0, 5),
    };

    if (passesCheck) {
      passes.push(result);
    } else {
      failures.push(result);
    }
  });
}

if (failures.length > 0) {
  console.log('❌ FAILING COMBINATIONS:\n');
  failures.forEach(({ context, ratio, minRatio, examples }) => {
    console.log(`  ${context}`);
    console.log(`    Ratio: ${ratio}:1 (Required: ${minRatio}:1 for normal text)`);
    if (examples && examples.length > 0) {
      console.log('    Examples:');
      examples.forEach((ex) => console.log(`      - ${ex}`));
    }
    console.log('');
  });
}

if (passes.length > 0) {
  console.log('✅ PASSING COMBINATIONS:\n');
  passes.forEach(({ context, ratio }) => {
    console.log(`  ${context} - ${ratio}:1 (✓)`);
  });
}

console.log('');
console.log('='.repeat(60));
console.log(`Summary: ${failures.length} failures, ${passes.length} passes`);
console.log('='.repeat(60));

if (failures.length > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

