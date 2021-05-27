import { RabbitMqServiceExtends } from '../interface/rabbit-mq-service-extends';
import { ApiRequestUtil } from '../util/api-request-util';
import { AmqpServiceImpl } from './amqp-service-impl';

export class RabbitApiImpl extends AmqpServiceImpl implements RabbitMqServiceExtends {

  createQueueByApi(name: string): string {
    ApiRequestUtil.putRequest({})
    return '';
  }

  createVhost(name: string): string {
    return '';
  }

}