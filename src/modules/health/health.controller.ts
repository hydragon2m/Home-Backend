import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { ServiceResult } from '../../common/utils/service-result';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    const status = await this.health.check([
      () => this.db.pingCheck('database'),
    ]);
    return ServiceResult.success(status, 'Kiểm tra sức khỏe hệ thống thành công');
  }
}
