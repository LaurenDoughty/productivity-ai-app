/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Server configuration
 */
export interface ServerConfig {
  port: number;
  staticDir: string;
  healthCheckPath: string;
  enableCompression: boolean;
  nodeEnv: string;
}

/**
 * Load server configuration from environment variables
 */
export function loadServerConfig(): ServerConfig {
  return {
    port: parseInt(process.env.PORT || '8080', 10),
    staticDir: process.env.STATIC_DIR || 'dist',
    healthCheckPath: process.env.HEALTH_CHECK_PATH || '/health',
    enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
    nodeEnv: process.env.NODE_ENV || 'development',
  };
}
