import { Channel, Connection, Options } from 'amqplib';
import { Replies } from 'amqplib/properties';
import { Logger } from 'log4js';
import { PublicConfigLoader } from '../config/public-config-loader';
import { AmqpQueueInterface } from '../interface/amqp-queue-interface';
import { OriginalMessageInterface } from '../interface/original-message-interface';
import OriginalQueueInterface from '../interface/original-queue-interface';
import { PublicConfigModel } from '../model/public-config-model';
import { QueueEnum } from '../model/queue-enum';
import { AmqpConnectUtil } from '../util/amqp-connect-util';
import AssertQueue = Options.AssertQueue;

export class AmqpImpl implements OriginalQueueInterface, AmqpQueueInterface, OriginalMessageInterface {
  // logger
  // @ts-ignore
  private readonly logger: Logger | undefined;
  // current queue type
  private readonly queueType: QueueEnum;
  // current instance name
  private readonly name: string;
  // config
  protected config: PublicConfigModel | undefined;

  // current amqp url
  protected currentAmqpUrl: string | undefined;

  // current amqp connect thi should not overwrite
  protected amqpInstance: Connection | undefined;
  // default channel
  protected defaultChannel: Channel | undefined;

  /**
   *
   * @param name
   * @param queueType
   * @param url
   * @param amqpOptions
   */
  constructor(name: string, queueType: QueueEnum, url?: string) {
    this.currentAmqpUrl = url;
    if (!url) {
      this.config = PublicConfigLoader.getNecessaryConfig(name, queueType);
      this.currentAmqpUrl = this.config.amqpUrl;
    }
    this.queueType = queueType;
    this.name = name;
  }

  /**
   *
   * @param amqpOptions
   */
  public async ready(amqpOptions?: any) {
    // check already instanced
    if (this.amqpInstance !== undefined) {
      this.logger!.warn(`Amqp Instance ${this.name} Already initialized Passing Operation`);
    }
    //check amqp server url
    if (!this.currentAmqpUrl) {
      throw new Error(`${this.name}-${this.queueType} Missing amqp server config`);
    }
    this.amqpInstance = await AmqpConnectUtil.createConnect(this.currentAmqpUrl, amqpOptions);
    this.defaultChannel = await this.amqpInstance.createChannel();
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

  async assertQueue(name: string, options?: AssertQueue): Promise<Replies.AssertQueue> {
    return await this.defaultChannel!.assertQueue(name, options);
  }

  async getQueueSimpleStatus(name: string): Promise<Replies.AssertQueue> {
    return await this.defaultChannel!.checkQueue(name);
  }

  async bindQueueExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty> {
    return await this.defaultChannel!.bindQueue(name, exchange, bindKey, args);
  }

  async unbindQueueExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty> {
    return await this.defaultChannel!.unbindQueue(name, exchange, bindKey, args);
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
