/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';
// import { imagetools } from 'vite-plugin-imagetools';
import fs from 'fs';
import path from 'path';
import { gzipSync } from 'zlib';

// Bundle size validation plugin
function bundleSizeCheck(): Plugin {
  return {
    name: 'bundle-size-check',
    closeBundle() {
      const distPath = path.resolve(__dirname, 'dist');
      const assetsPath = path.join(distPath, 'assets');
      
      if (!fs.existsSync(assetsPath)) {
        console.warn('⚠️  Assets directory not found, skipping bundle size check');
        return;
      }

      let totalSize = 0;
      let totalGzipSize = 0;
      const report: Record<string, { size: number; gzipSize: number }> = {};

      // Read all files in assets directory
      const files = fs.readdirSync(assetsPath);
      
      for (const file of files) {
        const filePath = path.join(assetsPath, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isFile() && !file.endsWith('.gz') && !file.endsWith('.br')) {
          const content = fs.readFileSync(filePath);
          const gzipSize = gzipSync(content).length;
          
          totalSize += stats.size;
          totalGzipSize += gzipSize;
          
          report[file] = {
            size: stats.size,
            gzipSize: gzipSize,
          };
        }
      }

      // Generate report
      const reportData = {
        timestamp: new Date().toISOString(),
        totalSize: totalSize,
        totalGzipSize: totalGzipSize,
        totalSizeKB: (totalSize / 1024).toFixed(2),
        totalGzipSizeKB: (totalGzipSize / 1024).toFixed(2),
        files: report,
      };

      // Write JSON report
      fs.writeFileSync(
        path.join(distPath, 'bundle-report.json'),
        JSON.stringify(reportData, null, 2)
      );

      // Write HTML report
      const htmlReport = `
<!DOCTYPE html>
<html>
<head>
  <title>Bundle Size Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .summary p { margin: 5px 0; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #4CAF50; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    .error { color: red; font-weight: bold; }
    .success { color: green; font-weight: bold; }
  </style>
</head>
<body>
  <h1>Bundle Size Report</h1>
  <div class="summary">
    <p><strong>Generated:</strong> ${reportData.timestamp}</p>
    <p><strong>Total Size:</strong> ${reportData.totalSizeKB} KB</p>
    <p><strong>Total Gzipped Size:</strong> ${reportData.totalGzipSizeKB} KB</p>
    <p class="${totalGzipSize / 1024 > 500 ? 'error' : 'success'}">
      <strong>Status:</strong> ${totalGzipSize / 1024 > 500 ? '❌ EXCEEDS LIMIT' : '✅ WITHIN LIMIT'}
    </p>
  </div>
  <h2>File Details</h2>
  <table>
    <tr>
      <th>File</th>
      <th>Size (KB)</th>
      <th>Gzipped (KB)</th>
      <th>Compression Ratio</th>
    </tr>
    ${Object.entries(report)
      .map(
        ([file, data]) => `
    <tr>
      <td>${file}</td>
      <td>${(data.size / 1024).toFixed(2)}</td>
      <td>${(data.gzipSize / 1024).toFixed(2)}</td>
      <td>${((1 - data.gzipSize / data.size) * 100).toFixed(1)}%</td>
    </tr>
    `
      )
      .join('')}
  </table>
</body>
</html>
      `;

      fs.writeFileSync(path.join(distPath, 'bundle-report.html'), htmlReport);

      // Console output
      console.log('\n📦 Bundle Size Report:');
      console.log(`   Total Size: ${reportData.totalSizeKB} KB`);
      console.log(`   Total Gzipped: ${reportData.totalGzipSizeKB} KB`);

      // Warn if exceeds limit (not failing build for now)
      if (totalGzipSize / 1024 > 500) {
        console.warn(
          `⚠️  Bundle size ${(totalGzipSize / 1024).toFixed(2)}KB exceeds limit of 500KB (gzipped)`
        );
        console.warn(`   This should be optimized in a future iteration.\n`);
      } else {
        console.log(`   ✅ Bundle size within 500KB limit\n`);
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // Bundle analysis
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
    // Bundle size validation
    bundleSizeCheck(),
  ],
  build: {
    target: 'es2015',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          motion: ['framer-motion'],
          markdown: ['react-markdown'],
        },
      },
    },
    chunkSizeWarningLimit: 500,
  },
});
