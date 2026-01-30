#!/usr/bin/env node


/**
 * Accessibility Test
 * Überprüft die Barrierefreiheit der Website
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('\n=== Accessibility Audit ===\n');

// Check for common accessibility issues in HTML files
const distDir = path.join(__dirname, '../dist');
const htmlFiles = glob.sync(`${distDir}/**/*.html`);

let issues = 0;
let checks = 0;

// Astro "server" output does not emit HTML files by default.
// In that case, fall back to scanning source files for basic a11y hygiene.
const hasBuiltHtml = htmlFiles.length > 0;
const sourceFiles = hasBuiltHtml
  ? []
  : glob.sync(path.join(__dirname, '../src/**/*.{astro,html}'));

const filesToScan = hasBuiltHtml ? htmlFiles : sourceFiles;

filesToScan.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');

  const rel = hasBuiltHtml
    ? path.relative(distDir, file).replace(/\\/g, '/')
    : path.relative(path.join(__dirname, '..'), file).replace(/\\/g, '/');

  // Check for lang attribute only when scanning built HTML
  if (hasBuiltHtml) {
    const expectedLang = rel.startsWith('en/') ? 'en-CH' : 'de-CH';
    if (!content.includes(`lang=\"${expectedLang}\"`)) {
      console.log(`⚠ Missing/incorrect lang attribute (expected ${expectedLang}) in ${rel}`);
      issues++;
    }
    checks++;
  }

  // Check for alt text in images (<img ...>)
  const imgMatches = content.match(/<img\s[^>]*>/g) || [];
  imgMatches.forEach(img => {
    if (!img.includes('alt=')) {
      console.log(`⚠ Image missing alt text in ${rel}: ${img.substring(0, 70)}...`);
      issues++;
    }
  });
  checks += imgMatches.length;

  // Check for a single <h1> on page templates (best-effort)
  if (rel.startsWith('src/pages/') && rel.endsWith('.astro')) {
    const h1Count = (content.match(/<h1[^>]*>/g) || []).length;
    if (h1Count !== 1) {
      console.log(`⚠ Expected 1 <h1>, found ${h1Count} in ${rel}`);
      issues++;
    }
    checks++;
  }
});

console.log(`\nChecks performed: ${checks}`);
console.log(`Issues found: ${issues}`);
console.log(`Files scanned: ${filesToScan.length} (${hasBuiltHtml ? 'built html' : 'source scan'})\n`);

if (issues === 0) {
  console.log('✓ No accessibility issues found\n');
  process.exit(0);
} else {
  console.log('✗ Some accessibility issues found\n');
  process.exit(1); // Fail CI so we actually fix issues
}
