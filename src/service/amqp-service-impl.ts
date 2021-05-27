import { Channel, Connection } from 'amqplib';
import { LogFactory } from '../factory/log-factory';
import { AmqpConnectionInitializer } from '../init/amqp-connection-initializer';
import { AmqpServiceAdapter } from '../interface/amqp-service-adapter';

export class AmqpServiceImpl implements AmqpServiceAdapter {
  // logger
  private readonly logger;
  // current amqp connect thi should not overwrite
  private amqpInstance: Connection;
  // channel
  protected defaultChannel: Channel;

  // current service name
  private readonly name: string;
  // current instance url
  private readonly url: string | undefined;
  // options
  private readonly options: {} | undefined;

  constructor(name: string, url?: string, options?: {}, loopStatsusCheck: boolean) {
    this.name = name;
    this.url = url;
    this.options = options;
    LogFactory.flush(`amqp-${name}`);
    this.logger = LogFactory.getLogger(`amqp-${name}`);
  }

  public async init() {
    if (this.amqpInstance !== undefined) {
      this.logger.warn(`Amqp Instance ${this.name} Already initialized Passing Operation`);
    }
    this.amqpInstance = await AmqpConnectionInitializer.createAmqpConnection(this.name, this.url, this.options);
    this.defaultChannel = await this.amqpInstance.createChannel();
  }

  public async createCustomChannel(): Promise<Channel> {
    return await this.amqpInstance.createChannel();
  }

  changeMessageVisibility<T>(): T {
    return undefined;
  }

  changeMessageVisibilityBatch<T>(): T {
    return undefined;
  }

  creatQueue(params: paramType, callback?: callbackType): responseType {
    this.defaultChannel.crea(params);
    return undefined;
  }

  deleteMessage<T>(): T {
    return undefined;
  }

  deleteMessageBatch<T>(): T {
    return undefined;
  }

  deleteQueue(params: paramType, callback?: callbackType): responseType {
    return undefined;
  }

  getQueueAttributes(params: paramType, callback?: callbackType): responseType {
    return undefined;
  }

  getQueueUrl(params: paramType, callback?: callbackType): responseType {
    return undefined;
  }

  listQueue(): responseType {
    return undefined;
  }

  purgeQueue(params: paramType, callback?: callbackType): responseType {
    return undefined;
  }

  receiveMessage<T>(): T {
    return undefined;
  }

  sendMessage<T>(): T {
    return undefined;
  }

  sendMessageBatch<T>(): T {
    return undefined;
  }

  setQueueAttributes(params: paramType, callback?: callbackType): responseType {
    return undefined;
  }

}