/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Health check result for individual checks
 */
export interface HealthCheckResult {
  status: 'pass' | 'fail';
  message?: string;
  value?: number;
  threshold?: number;
}

/**
 * Complete health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    memory: HealthCheckResult;
    disk: HealthCheckResult;
    aiProvider: HealthCheckResult;
  };
}

/**
 * Health check service
 */
export class HealthCheckService {
  private readonly memoryThresholdMB = 400;

  /**
   * Perform complete health check
   */
  async performHealthCheck(): Promise<HealthCheckResponse> {
    const checks = {
      memory: await this.checkMemory(),
      disk: await this.checkDisk(),
      aiProvider: await this.checkAIProvider(),
    };

    const allHealthy = Object.values(checks).every((check) => check.status === 'pass');

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      checks,
    };
  }

  /**
   * Check memory usage
   */
  private async checkMemory(): Promise<HealthCheckResult> {
    const usage = process.memoryUsage();
    const heapUsedMB = usage.heapUsed / 1024 / 1024;

    return {
      status: heapUsedMB < this.memoryThresholdMB ? 'pass' : 'fail',
      value: Math.round(heapUsedMB),
      threshold: this.memoryThresholdMB,
      message:
        heapUsedMB < this.memoryThresholdMB
          ? 'Memory usage normal'
          : `Memory usage high: ${Math.round(heapUsedMB)}MB`,
    };
  }

  /**
   * Check disk space (basic check)
   */
  private async checkDisk(): Promise<HealthCheckResult> {
    // Basic disk check - in production, you'd use a library like 'diskusage'
    // For now, we'll just return pass
    return {
      status: 'pass',
      message: 'Disk space check not implemented',
    };
  }

  /**
   * Check AI provider connectivity
   */
  private async checkAIProvider(): Promise<HealthCheckResult> {
    try {
      // In a real implementation, we'd check if the AI provider is accessible
      // For now, we'll check if the required environment variables are set
      const aiProvider = process.env.VITE_AI_PROVIDER || 'gemini';
      
      if (aiProvider === 'gemini') {
        const hasKey = !!process.env.GEMINI_API_KEY;
        return {
          status: hasKey ? 'pass' : 'fail',
          message: hasKey ? 'Gemini API key configured' : 'Gemini API key missing',
        };
      } else if (aiProvider === 'bedrock') {
        const hasRegion = !!process.env.AWS_REGION;
        return {
          status: hasRegion ? 'pass' : 'fail',
          message: hasRegion ? 'AWS region configured' : 'AWS region missing',
        };
      }

      return {
        status: 'fail',
        message: `Unknown AI provider: ${aiProvider}`,
      };
    } catch (error) {
      return {
        status: 'fail',
        message: `AI provider check failed: ${(error as Error).message}`,
      };
    }
  }
}
