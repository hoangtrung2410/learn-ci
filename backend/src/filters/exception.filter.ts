import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ValidationError } from 'class-validator';
import { Response } from 'express';
import { LanguageCode } from 'src/constants';

@Catch()
export class ExceptionFilter implements ExceptionFilter {
  constructor() {}

  async catch(exception: HttpException, host: ArgumentsHost) {
    await this.sendErrorToQueue(exception, host);
    switch (host.getType()) {
      case 'rpc':
        return this.handleExceptionWithRpcContext(exception);
      case 'http':
        return this.handleExceptionWithHttpContext(exception, host);
    }
  }

  async handleExceptionWithHttpContext(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    if (exception instanceof HttpException) {
      return response
        .status(exception.getStatus())
        .json(await this.getMessage(exception, ctx.getRequest().i18nLang));
    } else {
      Logger.error(exception.stack);
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'COMMON::SOMETHING_WENT_WRONG',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  private async sendErrorToQueue(exception: any, host: ArgumentsHost) {
    const payload = {
      type: host.getType(),
      message: exception.message || exception,
      stack: exception.stack || null,
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      serviceName: 'Auth-service',
    };
    try {
      console.log(payload);
    } catch (err) {
      Logger.error('Failed to send error to RabbitMQ', err);
    }
  }

  async handleExceptionWithRpcContext(exception) {
    if (exception instanceof HttpException) {
      const exceptionHasBeenTranslated = await this.getMessage(exception, 'en');
      throw new RpcException(exceptionHasBeenTranslated.message);
    } else {
      Logger.error(exception.stack);
      throw new RpcException('COMMON::SOMETHING_WENT_WRONG');
    }
  }

  async getMessage(exception: HttpException, lang: string) {
    const exceptionResponse = exception.getResponse() as any;

    if (exceptionResponse.hasOwnProperty('message')) {
      if (exceptionResponse.message instanceof Array) {
        exceptionResponse.message = await this.translateArray(
          exceptionResponse.message,
          lang,
        );
      } else {
        if (
          exceptionResponse.message.match(
            /^Unexpected token .* JSON at position [\d]*$/,
          )
        )
          exceptionResponse.message = 'COMMON::INVALID_BODY_FORMAT';
      }

      return {
        statusCode: exception.getStatus(),
        message: exceptionResponse.message || exceptionResponse,
      };
    }
    return {
      statusCode: exception.getStatus(),
      message: exceptionResponse,
    };
  }

  async translateArray(errors: any[], lang: string) {
    const data = [];
    for (let i = 0; i < errors.length; i++) {
      const item = errors[i];
      if (typeof item === 'string') {
        data.push(item);
        continue;
      } else if (item instanceof ValidationError) {
        await this.getValidateErrorMessages(item, data, lang);
        continue;
      }
      data.push(item);
    }
    return data;
  }

  async getValidateErrorMessages(
    node: ValidationError,
    data,
    lang: string = LanguageCode.EN,
  ) {
    if (node.constraints) {
      const message = await Promise.all(
        Object.values(node.constraints).map(async (value: string) => value),
      );
      data.push({ field: node.property, message: message });
    }
    if (node.children && node.children.length !== 0) {
      node.children.forEach((item) => {
        this.getValidateErrorMessages(item, data, lang);
      });
    } else {
      return data;
    }
  }
}
