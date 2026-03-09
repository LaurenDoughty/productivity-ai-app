/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { loadServerConfig } from './config.js';
import { HealthCheckService } from './health.js';
import { securityHeaders, requestLogger, cacheHeaders, errorHandler } from './middleware.js';
import { handleGenerateRequest } from './ai-proxy.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const config = loadServerConfig();
const healthCheckService = new HealthCheckService();

// Middleware
if (config.enableCompression) {
  app.use(compression());
}
app.use(express.json({ limit: '1mb' }));
app.use(requestLogger);
app.use(securityHeaders);

// Health check endpoint
app.get(config.healthCheckPath, async (_req, res) => {
  const startTime = Date.now();
  
  try {
    const healthCheck = await healthCheckService.performHealthCheck();
    const responseTime = Date.now() - startTime;

    // Log if response time exceeds threshold
    if (responseTime > 100) {
      console.warn(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'warn',
          message: 'Health check response time exceeded 100ms',
          responseTime: `${responseTime}ms`,
        })
      );
    }

    const statusCode = healthCheck.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(healthCheck);
  } catch (error) {
    console.error(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message: 'Health check failed',
        error: (error as Error).message,
      })
    );
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// AI proxy endpoint
app.post('/api/generate', handleGenerateRequest);

// Static file serving with cache headers
app.use(cacheHeaders);
app.use(express.static(path.join(__dirname, '..', config.staticDir), {
  setHeaders: (res, filePath) => {
    // Ensure correct MIME types
    if (filePath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    }
  }
}));

// SPA fallback - serve index.html for all other routes
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', config.staticDir, 'index.html'));
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Server started',
      port: config.port,
      nodeEnv: config.nodeEnv,
      staticDir: config.staticDir,
      healthCheckPath: config.healthCheckPath,
      version: process.env.APP_VERSION || '1.0.0',
      aiProvider: process.env.VITE_AI_PROVIDER || 'gemini',
    })
  );
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'SIGTERM received, shutting down gracefully',
    })
  );
  process.exit(0);
});
