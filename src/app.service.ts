import { Injectable } from '@nestjs/common';
import { ServiceResult } from './common/utils/service-result';

@Injectable()
export class AppService {
  getHello() {
    return ServiceResult.success('Hello World!', 'Hệ thống đang hoạt động bình thường');
  }
}
