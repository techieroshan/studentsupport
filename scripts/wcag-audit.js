#!/usr/bin/env node

/**
 * WCAG 2.2 AA Color Contrast Audit Script
 * 
 * This script checks color combinations used in the codebase
 * against WCAG 2.2 AA contrast requirements:
 * - Normal text: 4.5:1 minimum
 * - Large text (18pt+ or 14pt+ bold): 3:1 minimum
 * - UI components: 3:1 minimum
 */

// Tailwind color palette from tailwind.config.js
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

// Known problematic combinations from codebase analysis
const problematicCombinations = [
  // Light text on white/light backgrounds
  { fg: colors.brand[50], bg: colors.white, context: 'text-brand-50 on white', isLarge: false },
  { fg: colors.brand[100], bg: colors.white, context: 'text-brand-100 on white', isLarge: false },
  { fg: colors.brand[200], bg: colors.white, context: 'text-brand-200 on white', isLarge: false },
  { fg: colors.slate[300], bg: colors.white, context: 'text-slate-300 on white', isLarge: false },
  { fg: colors.slate[400], bg: colors.white, context: 'text-slate-400 on white', isLarge: false },
  { fg: colors.slate[500], bg: colors.white, context: 'text-slate-500 on white', isLarge: false },
  
  // Text on light backgrounds
  { fg: colors.brand[700], bg: colors.brand[50], context: 'text-brand-700 on bg-brand-50', isLarge: false },
  { fg: colors.brand[700], bg: colors.brand[100], context: 'text-brand-700 on bg-brand-100', isLarge: false },
  { fg: colors.emerald[700], bg: colors.emerald[50], context: 'text-emerald-700 on bg-emerald-50', isLarge: false },
  { fg: colors.emerald[700], bg: colors.emerald[100], context: 'text-emerald-700 on bg-emerald-100', isLarge: false },
  { fg: colors.slate[600], bg: colors.slate[50], context: 'text-slate-600 on bg-slate-50', isLarge: false },
  { fg: colors.slate[700], bg: colors.slate[100], context: 'text-slate-700 on bg-slate-100', isLarge: false },
  
  // White text on colored backgrounds (with opacity)
  { fg: colors.white, bg: colors.brand[600], context: 'text-white on bg-brand-600', isLarge: false },
  { fg: colors.white, bg: colors.brand[700], context: 'text-white on bg-brand-700', isLarge: false },
  // Note: bg-emerald-600 with text-white has been replaced with bg-emerald-700 throughout the codebase
  { fg: colors.white, bg: colors.emerald[700], context: 'text-white on bg-emerald-700', isLarge: false },
  
  // Large text variants
  { fg: colors.brand[200], bg: colors.white, context: 'text-brand-200 on white (large)', isLarge: true },
  { fg: colors.brand[50], bg: colors.white, context: 'text-brand-50 on white (large)', isLarge: true },
  { fg: colors.slate[400], bg: colors.white, context: 'text-slate-400 on white (large)', isLarge: true },
];

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

problematicCombinations.forEach(({ fg, bg, context, isLarge }) => {
  const { ratio, passes: passesCheck, minRatio } = checkContrast(fg, bg, isLarge);
  const result = {
    context,
    foreground: fg,
    background: bg,
    ratio: ratio.toFixed(2),
    minRatio,
    passes: passesCheck,
    isLarge,
  };
  
  if (passesCheck) {
    passes.push(result);
  } else {
    failures.push(result);
  }
});

if (failures.length > 0) {
  console.log('❌ FAILING COMBINATIONS:\n');
  failures.forEach(({ context, ratio, minRatio, isLarge }) => {
    console.log(`  ${context}`);
    console.log(`    Ratio: ${ratio}:1 (Required: ${minRatio}:1 for ${isLarge ? 'large' : 'normal'} text)`);
    console.log('');
  });
}

if (passes.length > 0) {
  console.log('✅ PASSING COMBINATIONS:\n');
  passes.forEach(({ context, ratio, minRatio }) => {
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

