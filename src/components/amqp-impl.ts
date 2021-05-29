import { Channel, Connection, Options } from 'amqplib';
import { Replies } from 'amqplib/properties';
import { Logger } from 'log4js';
import { PublicConfigLoader } from '../config/public-config-loader';
import { AmqpQueueInterface } from '../interface/amqp-queue-interface';
import { PublicConfigModel } from '../model/public-config-model';
import { QueueEnum } from '../model/queue-enum';
import { AmqpConnectUtil } from '../util/amqp-connect-util';
import { AmqpExchangeInterface } from '../interface/amqp-exchange-interface';
import { AmqpMessageInterface } from '../interface/amqp-message-interface';
import AssertQueue = Options.AssertQueue;

export class AmqpImpl implements AmqpQueueInterface, AmqpExchangeInterface, AmqpMessageInterface {
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

  async assertQueue(name: string, options?: AssertQueue): Promise<Replies.AssertQueue> {
    return await this.defaultChannel!.assertQueue(name, options);
  }

  async getQueueStatus(name: string): Promise<Replies.AssertQueue> {
    return await this.defaultChannel!.checkQueue(name);
  }

  async bindQueueToExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty> {
    return await this.defaultChannel!.bindQueue(name, exchange, bindKey, args);
  }

  async unbindQueueToExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty> {
    return await this.defaultChannel!.unbindQueue(name, exchange, bindKey, args);
  }

  async assertExchange(name: string, type: string, options?: Options.AssertExchange): Promise<Replies.AssertExchange> {
    return await this.defaultChannel!.assertExchange(name, type, options);
  }

  async checkExchange(name: string): Promise<Replies.Empty> {
    return await this.defaultChannel!.checkExchange(name);
  }

  async deleteExchange(name: string, options?: Options.DeleteExchange): Promise<Replies.Empty> {
    return await this.defaultChannel!.deleteExchange(name, options);
  }

  async bindExchangeToExchange(target: string, from: string, key: string, args?: any): Promise<Replies.Empty> {
    return await this.defaultChannel!.bindExchange(target, from, key, args);
  }

  async unbindExchangeToExchange(target: string, from: string, key: string, args?: any): Promise<Replies.Empty> {
    return await this.defaultChannel!.unbindExchange(target, from, key, args);
  }

  async sendMessageToExchange(exchangeName: string, key: string, content: Buffer, options: Options.Publish): Promise<Boolean> {
    return this.defaultChannel!.publish(exchangeName, key, content, options);
  }

}
