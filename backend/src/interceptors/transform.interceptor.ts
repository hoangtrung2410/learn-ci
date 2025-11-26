import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (data?.stream) {
          return data;
        }
        const response = context.switchToHttp().getResponse();
        return {
          success: true,
          code: response.statusCode,
          message: data?.messageResp || 'ok',
          data: data ?? null,
        };
      }),
    );
  }
}
