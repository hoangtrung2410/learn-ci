import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FactoryHelper } from '../../../common/helpers/factory.helper';

@Injectable()
export class TokenFactoryHelper extends FactoryHelper {
  constructor(private readonly configService: ConfigService) {
    super();
  }
}
