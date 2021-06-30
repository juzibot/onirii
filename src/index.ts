import { AmqpConnectService } from './service/amqp/amqp-connect-service';
import { RabbitManagerService } from './service/rabbit/rabbit-manager-service';

export default class Onirii {

  public static createAmqpConnect(name: string, amqpUrl?: string): AmqpConnectService {
    return new AmqpConnectService(name, amqpUrl);
  }

  public static createRabbitManagerService(name: string, managerApi?: string, auth?: string): RabbitManagerService {
    return new RabbitManagerService(name, managerApi, auth);
  }

}
