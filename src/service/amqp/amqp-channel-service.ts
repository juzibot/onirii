import amqp from 'amqplib';
import { Options, Replies } from 'amqplib/properties';
import { Logger } from 'log4js';
import { LogFactory } from '../../factory/log-factory';
import { AmqpExchangeInterface } from '../../interface/amqp/amqp-exchange-interface';
import { AmqpMessageInterface } from '../../interface/amqp/amqp-message-interface';
import { AmqpQueueInterface } from '../../interface/amqp/amqp-queue-interface';
import { EnhancerConsumerWrapper, OriginalConsumerWrapper } from '../../wrapper/amqp-wapper';

/**
 * Channel Service
 *
 * @since 1.0.0
 * @date 2021-06-02
 * @author Luminous(BGLuminous)
 */
export class AmqpChannelService implements AmqpQueueInterface, AmqpExchangeInterface, AmqpMessageInterface {
  // logger
  public readonly logger: Logger;
  // channel service instance current channel
  public readonly currentChannelInstance: amqp.Channel | amqp.ConfirmChannel;
  // current amqp channel service instance identify name
  public readonly instanceName: string;
  // original consume pool
  private originalConsumerPool: OriginalConsumerWrapper[] = [];
  // original enhancer consumer pool
  private enhancerConsumerPool: EnhancerConsumerWrapper[] = [];
  // consumer position
  private consumerPosition: number = -1;

  /**
   * Constructor this need inject current amqp channel instance to create
   *
   * @param {string} name identify name
   * @param {Channel} channel current amqp channel
   */
  constructor(name: string, channel: amqp.Channel | amqp.ConfirmChannel) {
    this.instanceName = name;
    // init logger
    this.logger = LogFactory.create(name.substr(0, this.instanceName.lastIndexOf('-')));
    this.logger.info(`Creating Channel Service ${this.instanceName}`);
    // inject amqp channel/confirmChannel instance
    if (!channel) {
      throw new Error('Channel Service Inject Error, Current Amqp Channel Undefined');
    }
    this.currentChannelInstance = channel;
  }

  public async ackMessage(message: amqp.Message, allUp?: boolean): Promise<void> {
    await this.currentChannelInstance.ack(message, allUp);
  }

  public async ackAllMessage(): Promise<void> {
    await this.currentChannelInstance.ackAll();
  }

  public async createExchangeIfNotExist(name: string, type: string, options?: Options.AssertExchange): Promise<Replies.AssertExchange> {
    return await this.currentChannelInstance.assertExchange(name, type, options);
  }

  public async bindExchangeToExchange(target: string, from: string, key: string, args?: any): Promise<Replies.Empty> {
    return await this.currentChannelInstance.bindExchange(target, from, key, args);
  }

  public async bindQueueToExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty> {
    return await this.currentChannelInstance.bindQueue(name, exchange, bindKey, args);
  }

  public async killConsume(consumerName: string): Promise<boolean> {
    let targetConsumer: OriginalConsumerWrapper | EnhancerConsumerWrapper | undefined;
    targetConsumer = this.originalConsumerPool.find(element => element.consumerName === consumerName);
    if (targetConsumer) {
      await targetConsumer.kill();
      this.originalConsumerPool = this.originalConsumerPool.filter(element => element.consumerName !== consumerName);
      return true;
    }
    targetConsumer = this.enhancerConsumerPool.find(element => element.consumerName === consumerName);
    if (targetConsumer) {
      await targetConsumer.kill();
      this.enhancerConsumerPool = this.enhancerConsumerPool.filter(element => element.consumerName !== consumerName);
      return true;
    }
    this.logger.error(`Can't Kill Unknown Consumer ${consumerName}`);
    return false;
  }

  public async checkExchange(name: string): Promise<Replies.Empty> {
    return await this.currentChannelInstance.checkExchange(name);
  }

  public async createQueueIfNotExist(name: string, options?: Options.AssertQueue): Promise<Replies.AssertQueue> {
    return await this.currentChannelInstance.assertQueue(name, options);
  }

  public consume(queue: string, processor: (msg: amqp.ConsumeMessage | null) => void, options?: Options.Consume)
      : OriginalConsumerWrapper {
    const consumerName: string = options?.consumerTag || this.getNextConsumerName();
    const originalConsumer = new OriginalConsumerWrapper(consumerName, this, queue, processor, options);
    this.originalConsumerPool.push(originalConsumer);
    return originalConsumer;
  }

  public async deleteExchange(name: string, options?: Options.DeleteExchange): Promise<Replies.Empty> {
    return await this.currentChannelInstance.deleteExchange(name, options);
  }

  public async deleteQueue(name: string, options?: Options.DeleteQueue): Promise<Replies.DeleteQueue> {
    return await this.currentChannelInstance.deleteQueue(name, options);
  }

  /**
   * Create a enhancer consumer can control consumption time
   *
   * Note::each consumer can provide about 30 QPS
   *
   * @param {string} queue target queue list
   * @param {(msg: GetMessage) => void} processor each message processor
   * @param {number} delay each consumption interval time
   * @param {string} consumeName consumer identify name (identify name can use for kill consumer);
   * @param {Options.Get} options some as GetMessage() options
   * @return {Promise<EnhancerConsumerWrapper>}
   */
  public async enhancerConsume(
      queue: string,
      processor: (msg: amqp.GetMessage) => void,
      delay: number = 0,
      consumeName?: string,
      options?: Options.Get,
  ): Promise<EnhancerConsumerWrapper> {
    const consumerName: string = consumeName || this.getNextConsumerName();
    const enhancerConsumer = new EnhancerConsumerWrapper(consumerName, this, queue, processor, delay, options);
    this.enhancerConsumerPool.push(enhancerConsumer);
    return enhancerConsumer;
  }

  public async getCurrentMessage(queueName: string, options?: Options.Get): Promise<false | amqp.GetMessage> {
    return await this.currentChannelInstance.get(queueName, options);
  }

  public async getQueueStatus(name: string): Promise<Replies.AssertQueue> {
    return await this.currentChannelInstance.checkQueue(name);
  }

  public async rejectMessage(message: amqp.Message, allUp?: boolean, reQueue?: boolean): Promise<void> {
    this.currentChannelInstance.nack(message, allUp, reQueue);
    this.currentChannelInstance.reject(message, reQueue);
  }

  public async nackAll(reQueue?: boolean): Promise<void> {
    this.currentChannelInstance.nackAll(reQueue);
  }

  public async prefetch(count: number, global?: boolean): Promise<Replies.Empty> {
    return await this.currentChannelInstance.prefetch(count, global);
  }

  public async purgeQueue(name: string): Promise<Replies.PurgeQueue> {
    this.logger.warn(`Purging Queue ${name}`);
    return await this.currentChannelInstance.purgeQueue(name);
  }

  public async recover(): Promise<Replies.Empty> {
    return await this.currentChannelInstance.recover();
  }

  public async sendMessageToExchange(exchangeName: string, key: string, content: Buffer, options?: Options.Publish): Promise<boolean> {
    return this.currentChannelInstance.publish(exchangeName, key, content, options);
  }

  public async sendMessageToQueue(queueName: string, content: Buffer, options?: Options.Publish): Promise<boolean> {
    return this.currentChannelInstance.sendToQueue(queueName, content, options);
  }

  public async unbindExchangeToExchange(target: string, from: string, key: string, args?: any): Promise<Replies.Empty> {
    return await this.currentChannelInstance.unbindExchange(target, from, key, args);
  }

  public async unbindQueueToExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty> {
    return await this.currentChannelInstance.unbindQueue(name, exchange, bindKey, args);
  }

  public async close(): Promise<void> {
    for (let originalConsumerWrapper of this.originalConsumerPool) {
      await originalConsumerWrapper.kill();
    }
    for (let enhancerConsumerWrapper of this.enhancerConsumerPool) {
      await enhancerConsumerWrapper.kill();
    }
    await this.currentChannelInstance.close();
    this.logger.warn(`Killed Channel ${this.instanceName}`);
  }

  private getNextConsumerName() {
    this.consumerPosition++;
    return `${this.instanceName}-consumer-${this.consumerPosition}`;
  }

}
