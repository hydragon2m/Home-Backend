import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServiceResult } from '../utils/service-result';

export interface Response<T> {
  success: true;
  message?: string;
  data: T;
}

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((result) => {
        // Trường hợp Service trả về ServiceResult
        if (result instanceof ServiceResult) {
          return {
            success: true,
            message: result.message,
            data: result.data,
          };
        }

        // Trường hợp fallback cho các dữ liệu cũ hoặc không dùng ServiceResult
        let message = 'Thao tác thành công';
        let data = result;

        if (result && typeof result === 'object' && !Array.isArray(result)) {
          const { message: msg, ...rest } = result;
          if (msg) message = msg;
          data = Object.keys(rest).length > 0 ? rest : (Object.keys(result).length === 1 && result.message ? null : result);
          // Nếu chỉ có mỗi message thì data nên là null
          if (Object.keys(result).length === 1 && result.message) data = null;
        }
        
        return {
          success: true,
          message: message,
          data: data === undefined ? null : data,
        };
      }),
    );
  }
}
