// src/claims/infrastructure/filters/domain-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { DomainError } from '../../domain/errors/domain-error';
import { ClaimNotFoundException } from '../../application/exceptions/claim-not-found.exception';

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message || 'Internal server error';
    } else if (exception instanceof DomainError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message || 'Internal server error';
    } else if (exception instanceof ClaimNotFoundException) {
      status = HttpStatus.NOT_FOUND;
      message = exception.message || 'Internal server error';
    } else if (exception instanceof Error) {
      message = exception.message || 'Internal server error';
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
