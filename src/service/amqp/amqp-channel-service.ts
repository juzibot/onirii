import amqp from 'amqplib';
import { Options, Replies } from 'amqplib/properties';
import { Logger } from 'log4js';
import { LogFactory } from '../../factory/log-factory';
import { AmqpExchangeInterface } from '../../interface/amqp/amqp-exchange-interface';
import { AmqpExtraInterface } from '../../interface/amqp/amqp-extra-interface';
import { AmqpMessageInterface } from '../../interface/amqp/amqp-message-interface';
import { AmqpQueueInterface } from '../../interface/amqp/amqp-queue-interface';
import { AmqpChannelNamespace } from '../../model/amqp/amqp-channel-namespace';
import { AmqpOriginalConsumerWrapper } from '../../wrapper/amqp-original-consumer-wrapper';

/**
 * Channel Service
 *
 * @since 1.0.0
 * @date 2021-06-02
 * @author Luminous(BGLuminous)
 */
export class AmqpChannelService implements AmqpQueueInterface, AmqpExchangeInterface, AmqpMessageInterface,
  AmqpExtraInterface {
  // logger
  public readonly logger: Logger;
  // channel service instance current channel
  public readonly currentChannelInstance: amqp.Channel | amqp.ConfirmChannel;
  // current amqp channel service instance identify name
  public readonly instanceName: string;
  // original consume pool
  private originalConsumerPool: AmqpOriginalConsumerWrapper[] = [];
  // consumer position
  private consumerPosition = -1;

  /**
   * Constructor this need inject current amqp channel instance to create
   *
   * @param {string} name identify name
   * @param {amqp.Channel | amqp.ConfirmChannel} channel current amqp channel
   */
  constructor(name: string, channel: amqp.Channel | amqp.ConfirmChannel) {
    this.instanceName = name;
    // init logger
    this.logger = LogFactory.create(name.substr(0, this.instanceName.lastIndexOf('-')));
    this.logger.info(`Creating Channel Service ${ this.instanceName }`);
    // inject amqp channel/confirmChannel instance
    if (!channel) {
      throw new Error('Channel Service Inject Error, Current Amqp Channel Undefined');
    }
    this.currentChannelInstance = channel;
    this.addDefaultListener();
  }

  /**
   * Add default listener for each connect service instance
   *
   * @private
   */
  private addDefaultListener() {
    this.addErrorListener((err) => {
      this.logger.error(`Amqp Channel(${this.instanceName}) Got Error: ${ err } ${ JSON.stringify(err) }`);
    });
    this.addCloseListener(() => {
      this.logger.error(`Amqp Channel(${this.instanceName}) Closed`);
    });
  }

  /**
   * add close event listener
   *
   * @param process event emit callback
   */
  public addCloseListener(process: () => void) {
    this.currentChannelInstance?.on('close', () => {
      process();
    });
  }

  /**
   * add error event listener
   *
   * @param process event emit callback
   */
  public addErrorListener(process: (err: any) => void) {
    this.currentChannelInstance?.on('error', err => process(err));
  }

  /**
   * add return event listener
   *
   * @param process event emit callback
   */
  public addReturnListener(process: (returnData: any) => void) {
    this.currentChannelInstance?.on('return', err => process(err));
  }

  /**
   * add drain event listener
   *
   * @param process event emit callback
   */
  public addDrainListener(process: () => void) {
    this.currentChannelInstance?.on('drain', () => process());
  }

  /**
   * initialize mq exchange/queue/bind
   *
   * @param config  exchange/queue/bind config
   */
  public async initMetaConfigure(config: AmqpChannelNamespace.MetaConfigure): Promise<void> {
    if (config.queueList && config.queueList.length !== 0) {
      await this.initQueueConfigure(config.queueList);
    }
    if (config.exchangeList && config.exchangeList.length !== 0) {
      await this.initExchangeConfigure(config.exchangeList);
    }
    if (config.bindList && config.bindList.length !== 0) {
      await this.initBindConfigure(config.bindList);
    }
  }

  /**
   * initialize mq queue
   *
   * @param config queue config data
   * @param cleanMode delete then create
   */
  public async initQueueConfigure(config: AmqpChannelNamespace.AmqpQueue[], cleanMode = false)
    : Promise<void> {
    try {
      for (let amqpQueue of config) {
        if (cleanMode) {
          await this.currentChannelInstance.deleteQueue(amqpQueue.name, amqpQueue.cleanOption);
        }
        await this.currentChannelInstance.assertQueue(amqpQueue.name, amqpQueue.options);
      }
    } catch (err) {
      this.logger.error(`${ this.instanceName } initQueueConfigure() Got Error: ${ JSON.stringify(err) }`);
      throw err;
    }
  }

  /**
   * initialize mq exchange
   *
   * @param config  exchange config data
   * @param cleanMode delete then create
   */
  public async initExchangeConfigure(config: AmqpChannelNamespace.AmqpExchange[], cleanMode = false)
    : Promise<void> {
    try {
      for (let amqpExchange of config) {
        if (cleanMode) {
          await this.currentChannelInstance.deleteExchange(amqpExchange.name, amqpExchange.cleanOption);
        }
        await this.currentChannelInstance.assertExchange(amqpExchange.name, amqpExchange.type, amqpExchange.options);
      }
    } catch (err) {
      this.logger.error(`${ this.instanceName } initExchangeConfigure() Got Error: ${ JSON.stringify(err) }`);
      throw err;
    }
  }

  /**
   * initialize mq bind
   *
   * @param config bind config data
   */
  public async initBindConfigure(config: AmqpChannelNamespace.AmqpBind[]): Promise<void> {
    try {
      for (let amqpBind of config) {
        if (amqpBind.type === 'qte') {
          await this.bindQueueToExchange(
            amqpBind.fromSourceName,
            amqpBind.targetSourceName,
            amqpBind.key,
            amqpBind.options,
          );
        } else if (amqpBind.type === 'ete') {
          await this.bindExchangeToExchange(
            amqpBind.fromSourceName,
            amqpBind.targetSourceName,
            amqpBind.key,
            amqpBind.options,
          );
        }
      }
    } catch (err) {
      this.logger.error(`${ this.instanceName } initBindConfigure() Got Error: ${ JSON.stringify(err) }`);
      throw err;
    }
  }

  public async ackAllMessage(): Promise<void> {
    await this.currentChannelInstance.ackAll();
  }

  public async ackMessage(message: amqp.Message, allUp?: boolean): Promise<void> {
    await this.currentChannelInstance.ack(message, allUp);
  }

  public consume(queue: string, processor: (msg: amqp.ConsumeMessage | null) => void, options?: Options.Consume)
    : AmqpOriginalConsumerWrapper {
    const consumerName: string = options?.consumerTag || this.getNextConsumerName();
    const originalConsumer = new AmqpOriginalConsumerWrapper(consumerName, this, queue, processor, options);
    this.originalConsumerPool.push(originalConsumer);
    return originalConsumer;
  }

  public async getCurrentMessage(queueName: string, options?: Options.Get): Promise<false | amqp.GetMessage> {
    return this.currentChannelInstance.get(queueName, options);
  }

  public async killConsume(consumerName: string): Promise<boolean> {
    const targetConsumer: AmqpOriginalConsumerWrapper | undefined
      = this.originalConsumerPool.find(element => element.consumerName === consumerName);
    if (targetConsumer) {
      await targetConsumer.kill();
      this.originalConsumerPool = this.originalConsumerPool.filter(element => element.consumerName !== consumerName);
      return true;
    }
    this.logger.error(`Can't Kill Unknown Consumer ${ consumerName }`);
    return false;
  }

  public async nackAllMessage(reQueue?: boolean): Promise<void> {
    this.currentChannelInstance.nackAll(reQueue);
  }

  public async recover(): Promise<Replies.Empty> {
    return this.currentChannelInstance.recover();
  }

  public async rejectMessage(message: amqp.Message, allUp?: boolean, reQueue?: boolean): Promise<void> {
    try {
      this.currentChannelInstance.reject(message, reQueue);
    } catch (err) {
      this.currentChannelInstance.nack(message, allUp, reQueue);
    }
  }

  public async sendMessageToExchange(exchangeName: string, key: string, content: Buffer, options?: Options.Publish): Promise<boolean> {
    return this.currentChannelInstance.publish(exchangeName, key, content, options);
  }

  public async sendMessageToQueue(queueName: string, content: Buffer, options?: Options.Publish): Promise<boolean> {
    return this.currentChannelInstance.sendToQueue(queueName, content, options);
  }

  public async setPrefetchCount(count: number, global?: boolean): Promise<Replies.Empty> {
    return this.currentChannelInstance.prefetch(count, global);
  }

  public async bindExchangeToExchange(target: string, from: string, key: string, args?: any): Promise<Replies.Empty> {
    return this.currentChannelInstance.bindExchange(target, from, key, args);
  }

  public async createExchangeIfNotExist(name: string, type: string, options?: Options.AssertExchange): Promise<Replies.AssertExchange> {
    return this.currentChannelInstance.assertExchange(name, type, options);
  }

  public async deleteExchange(name: string, options?: Options.DeleteExchange): Promise<Replies.Empty> {
    return this.currentChannelInstance.deleteExchange(name, options);
  }

  public async getExchangeStatus(name: string): Promise<Replies.Empty> {
    return this.currentChannelInstance.checkExchange(name);
  }

  public async unbindExchangeToExchange(target: string, from: string, key: string, args?: any): Promise<Replies.Empty> {
    return this.currentChannelInstance.unbindExchange(target, from, key, args);
  }

  public async bindQueueToExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty> {
    return this.currentChannelInstance.bindQueue(name, exchange, bindKey, args);
  }

  public async createQueueIfNotExist(name: string, options?: Options.AssertQueue): Promise<Replies.AssertQueue> {
    return this.currentChannelInstance.assertQueue(name, options);
  }

  public async deleteQueue(name: string, options?: Options.DeleteQueue): Promise<Replies.DeleteQueue> {
    return this.currentChannelInstance.deleteQueue(name, options);
  }

  public async getQueueStatus(name: string): Promise<Replies.AssertQueue> {
    return this.currentChannelInstance.checkQueue(name);
  }

  public async purgeQueue(name: string): Promise<Replies.PurgeQueue> {
    this.logger.warn(`Purging Queue ${ name }`);
    return this.currentChannelInstance.purgeQueue(name);
  }

  public async unbindQueueToExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty> {
    return this.currentChannelInstance.unbindQueue(name, exchange, bindKey, args);
  }

  public async close(): Promise<void> {
    await Promise.all(this.originalConsumerPool.map(element => element.kill()));
    await this.currentChannelInstance.close();
    this.logger.warn(`Killed Channel ${ this.instanceName }`);
  }

  private getNextConsumerName() {
    this.consumerPosition++;
    return `${ this.instanceName }-consumer-${ this.consumerPosition }`;
  }

}
