#!/usr/bin/env node

// Quick contrast checker for specific color combinations

const colors = {
  slate: {
    200: '#e2e8f0',
    300: '#cbd5e1',
    500: '#64748b',
    600: '#475569',
    900: '#0f172a',
    950: '#020617',
  },
  brand: {
    600: '#2563eb',
    700: '#1d4ed8',
  },
  white: '#ffffff',
};

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(rgb) {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function getContrastRatio(color1, color2) {
  const lum1 = getLuminance(hexToRgb(color1));
  const lum2 = getLuminance(hexToRgb(color2));
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

const checks = [
  { fg: colors.slate[500], bg: colors.white, name: 'text-slate-500 on white (inactive buttons)' },
  { fg: colors.slate[300], bg: colors.slate[900], name: 'text-slate-300 on bg-slate-900 (hero text)' },
  { fg: colors.slate[600], bg: colors.slate[900], name: 'text-slate-600 on bg-slate-900 (footer)' },
  { fg: colors.slate[200], bg: colors.slate[900], name: 'text-slate-200 on bg-slate-900 (footer headings)' },
  { fg: colors.slate[500], bg: colors.slate[900], name: 'text-slate-500 on bg-slate-900 (footer copyright)' },
  { fg: colors.slate[500], bg: colors.slate[950], name: 'text-slate-500 on bg-slate-950 (partner strip)' },
  { fg: colors.brand[600], bg: colors.white, name: 'bg-brand-600 text-white (buttons)' },
];

console.log('Contrast Check for HowItWorksPage and Footer:\n');
checks.forEach(({ fg, bg, name }) => {
  const ratio = getContrastRatio(fg, bg);
  const passesNormal = ratio >= 4.5;
  const passesLarge = ratio >= 3;
  console.log(`${name}:`);
  console.log(`  Ratio: ${ratio.toFixed(2)}:1`);
  console.log(`  Normal text (4.5:1): ${passesNormal ? '✓' : '✗'}`);
  console.log(`  Large text (3:1): ${passesLarge ? '✓' : '✗'}`);
  console.log('');
});

