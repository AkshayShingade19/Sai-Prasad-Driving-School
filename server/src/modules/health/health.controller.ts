import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Public } from '../auth/public.decorator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private connection: Connection) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Service health check' })
  check() {
    const dbState = this.connection.readyState;
    return {
      status: dbState === 1 ? 'ok' : 'degraded',
      service: 'sai-prasad-driving-school-api',
      database: dbState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
    };
  }
}
