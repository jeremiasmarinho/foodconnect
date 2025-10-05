import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string | string[];
    let error: string;

    if (exception instanceof HttpException) {
      // Handle HTTP exceptions (validation errors, etc.)
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
        error = exception.name;
      } else {
        message = (exceptionResponse as any).message || exception.message;
        error = (exceptionResponse as any).error || exception.name;
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      // Handle Prisma database errors
      const {
        status: prismaStatus,
        message: prismaMessage,
        error: prismaError,
      } = this.handlePrismaError(exception);
      status = prismaStatus;
      message = prismaMessage;
      error = prismaError;
    } else if (exception instanceof Error) {
      // Handle other errors
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Erro interno do servidor';
      error = 'Internal Server Error';
    } else {
      // Handle unknown exceptions
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Erro interno do servidor';
      error = 'Internal Server Error';
    }

    // Log error details
    this.logger.error(
      `${request.method} ${request.url} - ${status} - ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    // Send error response
    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    });
  }

  private handlePrismaError(error: PrismaClientKnownRequestError): {
    status: number;
    message: string;
    error: string;
  } {
    switch (error.code) {
      case 'P2000':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Valor muito longo para o campo',
          error: 'Value Too Long',
        };

      case 'P2001':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Registro não encontrado',
          error: 'Record Not Found',
        };

      case 'P2002':
        return {
          status: HttpStatus.CONFLICT,
          message: 'Violação de restrição única',
          error: 'Unique Constraint Violation',
        };

      case 'P2003':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Violação de chave estrangeira',
          error: 'Foreign Key Constraint Violation',
        };

      case 'P2004':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Violação de restrição',
          error: 'Constraint Violation',
        };

      case 'P2005':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Valor inválido para o campo',
          error: 'Invalid Field Value',
        };

      case 'P2006':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Valor inválido fornecido',
          error: 'Invalid Value',
        };

      case 'P2007':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Erro de validação de dados',
          error: 'Data Validation Error',
        };

      case 'P2008':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Falha ao analisar a consulta',
          error: 'Query Parsing Failed',
        };

      case 'P2009':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Falha na validação da consulta',
          error: 'Query Validation Failed',
        };

      case 'P2010':
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Falha na consulta bruta',
          error: 'Raw Query Failed',
        };

      case 'P2011':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Violação de restrição não nula',
          error: 'Null Constraint Violation',
        };

      case 'P2012':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Valor obrigatório ausente',
          error: 'Missing Required Value',
        };

      case 'P2013':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Argumento obrigatório ausente',
          error: 'Missing Required Argument',
        };

      case 'P2014':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Mudança violaria relação obrigatória',
          error: 'Required Relation Violation',
        };

      case 'P2015':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Registro relacionado não encontrado',
          error: 'Related Record Not Found',
        };

      case 'P2016':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Erro de interpretação da consulta',
          error: 'Query Interpretation Error',
        };

      case 'P2017':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Registros não conectados',
          error: 'Records Not Connected',
        };

      case 'P2018':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Registros conectados necessários não encontrados',
          error: 'Required Connected Records Not Found',
        };

      case 'P2019':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Erro de entrada',
          error: 'Input Error',
        };

      case 'P2020':
        return {
          status: HttpStatus.BAD_REQUEST,
          message: 'Valor fora do intervalo',
          error: 'Value Out Of Range',
        };

      case 'P2021':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Tabela não existe no banco de dados',
          error: 'Table Does Not Exist',
        };

      case 'P2022':
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'Coluna não existe no banco de dados',
          error: 'Column Does Not Exist',
        };

      case 'P2025':
        return {
          status: HttpStatus.NOT_FOUND,
          message:
            'Operação falhou porque depende de um ou mais registros que eram obrigatórios mas não foram encontrados',
          error: 'Record To Update Not Found',
        };

      default:
        return {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Erro de banco de dados',
          error: 'Database Error',
        };
    }
  }
}
