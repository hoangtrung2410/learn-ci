import {
  EntitySubscriberInterface,
  EventSubscriber,

} from 'typeorm';

import { TokenEntity } from '../entities/token.entity';

@EventSubscriber()
export class TokenSubscriber implements EntitySubscriberInterface<TokenEntity> {
  listenTo() {
    return TokenEntity;
  }
}
