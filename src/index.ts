import { AmqpConnectService } from './service/amqp/amqp-connect-service';
import { RabbitEnhancer, RabbitEnhancerConfigure } from './service/rabbit-enhancer';
import { RabbitManagerService } from './service/rabbit/rabbit-manager-service';

export default class Onirii {

  public createAmqpConnect(name: string, amqpUrl?: string) {
    return new AmqpConnectService(name, 0, amqpUrl);
  }

  public createRabbitManagerService(name: string, managerApi?: string, auth?: string) {
    return new RabbitManagerService(name, managerApi, auth);
  }

  public createRabbitEnhancer(name: string, protocol: 'amqp091' | 'http', configure: RabbitEnhancerConfigure) {
    return new RabbitEnhancer(name, protocol, configure);
  }
}
