import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check API health status' })
  async check() {
    const isMongoUp = this.mongoConnection.readyState === 1;

    return {
      status: isMongoUp ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        api: { status: 'up' },
        database: { status: isMongoUp ? 'up' : 'down' },
      },
    };
  }

  @Get('readiness')
  @ApiOperation({ summary: 'Check if API is ready to accept traffic' })
  async readiness() {
    const isMongoReady = this.mongoConnection.readyState === 1;

    return {
      status: isMongoReady ? 'ready' : 'not ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: isMongoReady ? 'connected' : 'disconnected',
      },
    };
  }

  @Get('liveness')
  @ApiOperation({ summary: 'Check if API is alive' })
  async liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
    };
  }
}
