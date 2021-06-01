import amqp from 'amqplib';

export class AmqpChannelService {

  private readonly cuurentChannelInstance: amqp.Channel | amqp.ConfirmChannel;

  constructor(name: string, channel: amqp.Channel | amqp.ConfirmChannel) {
    this.cuurentChannelInstance = channel;
  }


}
