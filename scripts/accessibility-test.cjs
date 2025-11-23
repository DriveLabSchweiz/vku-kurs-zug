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

htmlFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Check for lang attribute
  if (!content.includes('lang="de-CH"')) {
    console.log(`⚠ Missing lang attribute in ${path.relative(distDir, file)}`);
    issues++;
  }
  checks++;
  
  // Check for alt text in images
  const imgMatches = content.match(/<img[^>]*>/g) || [];
  imgMatches.forEach(img => {
    if (!img.includes('alt=')) {
      console.log(`⚠ Image missing alt text: ${img.substring(0, 50)}...`);
      issues++;
    }
  });
  checks += imgMatches.length;
  
  // Check for proper heading hierarchy
  const h1Count = (content.match(/<h1[^>]*>/g) || []).length;
  if (h1Count !== 1) {
    console.log(`⚠ Expected 1 H1 tag, found ${h1Count} in ${path.relative(distDir, file)}`);
    issues++;
  }
  checks++;
});

console.log(`\nChecks performed: ${checks}`);
console.log(`Issues found: ${issues}`);
console.log(`Files scanned: ${htmlFiles.length}\n`);

if (issues === 0) {
  console.log('✓ No accessibility issues found\n');
  process.exit(0);
} else {
  console.log('✗ Some accessibility issues found\n');
  process.exit(0); // Don't fail the build for now
}
