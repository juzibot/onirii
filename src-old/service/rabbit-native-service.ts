import { Options } from 'amqplib';
import { Replies } from 'amqplib/properties';
import { OriginalMessageInterface } from '../interface/original-message-interface';
import OriginalQueueInterface from '../interface/original-queue-interface';
import { QueueEnum } from '../model/queue-enum';
import { AmqpService } from './amqp-service';

export class RabbitNativeService extends AmqpService implements OriginalQueueInterface, OriginalMessageInterface {

  constructor(name: string, amqpUrl?: string) {
    super(name, QueueEnum.RABBIT, amqpUrl);
  }

  public async ready(amqpOptions?: any): Promise<void> {
    await super.ready(amqpOptions);
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
    throw new Error('Amqp not Supported Get Queue Operation Try Use assertQueue() or getQueueStatus()');
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
