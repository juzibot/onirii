import { Options } from 'amqplib';

export interface AmqpMessageInterface {

  sendMessageToExchange(exchangeName: string, key: string, content: Buffer, options: Options.Publish): Promise<Boolean>;

}
