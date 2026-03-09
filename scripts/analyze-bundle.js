/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const fs = require('fs');
const path = require('path');

console.log('=== Bundle Analysis ===\n');

// Read bundle report
const reportPath = path.join(__dirname, '..', 'dist', 'bundle-report.json');

if (!fs.existsSync(reportPath)) {
  console.error('❌ Bundle report not found. Run `npm run build` first.');
  process.exit(1);
}

const report = JSON.parse(fs.readFileSync(reportPath, 'utf-8'));

console.log(`Generated: ${report.timestamp}`);
console.log(`Total Size: ${report.totalSizeKB} KB`);
console.log(`Total Gzipped: ${report.totalGzipSizeKB} KB`);
console.log('');

// Check against budget
const BUDGET_KB = 500;
const gzipSizeKB = parseFloat(report.totalGzipSizeKB);

if (gzipSizeKB > BUDGET_KB) {
  console.log(`❌ Bundle size ${gzipSizeKB} KB exceeds budget of ${BUDGET_KB} KB`);
  console.log(`   Exceeded by: ${(gzipSizeKB - BUDGET_KB).toFixed(2)} KB\n`);
  process.exit(1);
} else {
  console.log(`✅ Bundle size within budget (${BUDGET_KB} KB)`);
  console.log(`   Remaining: ${(BUDGET_KB - gzipSizeKB).toFixed(2)} KB\n`);
}

// Show largest files
console.log('Largest files:');
const files = Object.entries(report.files)
  .map(([name, data]) => ({
    name,
    size: data.gzipSize / 1024,
  }))
  .sort((a, b) => b.size - a.size)
  .slice(0, 10);

files.forEach((file, index) => {
  console.log(`  ${index + 1}. ${file.name}: ${file.size.toFixed(2)} KB`);
});

console.log('\n=== Analysis Complete ===');
