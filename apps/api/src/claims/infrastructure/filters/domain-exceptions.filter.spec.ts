import { DomainExceptionFilter } from './domain-exceptions.filter';
import { ArgumentsHost, HttpStatus, HttpException } from '@nestjs/common';
import { DomainError } from '../../domain/errors/domain-error';
import { ClaimNotFoundException } from '../../application/exceptions/claim-not-found.exception';

describe('DomainExceptionFilter', () => {
  let filter: DomainExceptionFilter;
  let mockArgumentsHost: any;
  let mockResponse: any;

  beforeEach(() => {
    filter = new DomainExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
    };
  });

  it('should handle DomainError and return 400', () => {
    const error = new DomainError('Business rule violated');

    filter.catch(error, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Business rule violated',
      }),
    );
  });

  it('should handle ClaimNotFoundException and return 404', () => {
    const error = new ClaimNotFoundException('Claim 123 not found');

    filter.catch(error, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Claim 123 not found',
      }),
    );
  });

  it('should handle HttpException and return its status', () => {
    const error = new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    filter.catch(error, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden',
      }),
    );
  });

  it('should handle unexpected errors and return 500', () => {
    const error = new Error('Database connection failed');

    filter.catch(error, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Database connection failed',
      }),
    );
  });

  it('should use default message for unexpected errors without message', () => {
    const error = new Error();
    delete (error as any).message;

    filter.catch(error, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal server error',
      }),
    );
  });
});
