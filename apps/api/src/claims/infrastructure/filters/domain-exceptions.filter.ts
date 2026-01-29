// src/claims/infrastructure/filters/domain-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DomainError } from '../../domain/errors/domain-error';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
    } else if (exception instanceof DomainError) {
      status = HttpStatus.BAD_REQUEST;
    } else if (exception.name === 'ClaimNotFoundException') {
      status = HttpStatus.NOT_FOUND;
    }

    response.status(status).json({
      statusCode: status,
      message: exception.message || 'Internal server error',
      timestamp: new Date().toISOString(),
    });
  }
}
