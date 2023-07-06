import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const body = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((payload) => ({
        status: body.statusCode,
        payload: payload,
      })),
    );
  }
}
