import { Injectable } from '@nestjs/common';
import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { AuthorizationService } from './authorization.service';

@Injectable()
export class IamConsumer {
  constructor(private readonly authService: AuthorizationService) {}

  @RabbitRPC({
    exchange: 'amq.direct',
    routingKey: 'IAM_SMART_MONITOR_VERIFY_ACCESS',
    queue: 'auth-service-queue_monitor_iam',
  })
  handleIamMessage(msg) {
    const { accessToken, action, module } = msg;
    const code = module + '::' + action;
    const permission = [code];
    return this.authService.verifyAccess(accessToken, permission);
  }
}
