import { HttpStatus } from '@nestjs/common';

export interface IResponseMessage {
  statusCode: HttpStatus;
  message: string;
}

export interface IRPCErrorMessage {
  error: string;
  message: string;
}
