import { AmqpImpl } from '../components/amqp-impl';
import OriginalQueueInterface from '../interface/original-queue-interface';
import { Options } from 'amqplib';
import { Replies } from 'amqplib/properties';
import { OriginalMessageInterface } from '../interface/original-message-interface';
import { QueueEnum } from '../model/queue-enum';

export class RabbitMqService extends AmqpImpl implements OriginalQueueInterface, OriginalMessageInterface {


  constructor(name: string, url?: string) {
    super(name, QueueEnum.RABBIT, url);
  }

  /**
   * amqp protocol not support create queue
   */
  createQueue(): void {
    throw new Error('Amqp not Supported Create Queue Operation Try Use createQueueByManager()');
  }

  /**
   * amqp protocol not support get queue
   */
  getQueue(): void {
    throw new Error('Amqp not Supported Get Queue Operation Try Use assertQueue() or getQueueSimpleStatus()');
  }

  async deleteQueue(name: string, options?: Options.DeleteQueue): Promise<Replies.DeleteQueue> {
    return await this.defaultChannel!.deleteQueue(name, options);
  }

  async purgeQueue(name: string): Promise<Replies.PurgeQueue> {
    return await this.defaultChannel!.purgeQueue(name);
  }

  async sendMessage(targetExchange: string, key: string, message: any, options: Options.Publish): Promise<boolean> {
    return this.defaultChannel!.publish(targetExchange, key, message, options);
  }

  sendMessageBatch<T>(): T {
    throw new Error('Method not implemented.');
  }

  receiveMessage<T>(): T {
    throw new Error('Method not implemented.');
  }

  deleteMessage<T>(): T {
    throw new Error('Method not implemented.');
  }

  deleteMessageBatch<T>(): T {
    throw new Error('Method not implemented.');
  }

  changeMessageVisibility<T>(): T {
    throw new Error('Method not implemented.');
  }

  changeMessageVisibilityBatch<T>(): T {
    throw new Error('Method not implemented.');
  }

}
