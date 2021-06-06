import * as amqp from 'amqplib';
import { Options } from 'amqplib/properties';
import { Logger } from 'log4js';
import { LogFactory } from '../factory/log-factory';
import { AmqpChannelService } from '../service/amqp/amqp-channel-service';
import { AmqpConfirmChannelService } from '../service/amqp/amqp-confirm-channel-service';

/**
 * Amqp Original Channel Standard Data
 */
export class OriginalChannelWrapper {
  // logger
  private readonly logger: Logger;
  // amqp original channel instance
  public readonly channel: amqp.Channel;
  // current amqp original channel service instance identify name
  public readonly instanceName: string;

  /**
   * Constructor
   *
   * @param {Channel} channel amqp original channel instance
   * @param {string} instanceName instance identify name
   */
  constructor(channel: amqp.Channel, instanceName: string) {
    this.channel = channel;
    this.instanceName = instanceName;
    this.logger = LogFactory.create(instanceName.substr(0, this.instanceName.lastIndexOf('-')));
    this.logger.info(`Creating Channel Wrapper ${this.instanceName}`);
  }

  /**
   * Close current channel
   *
   * @return {Promise<void>}
   */
  public async close() {
    await this.channel.close();
    this.logger.warn(`Killed Channel ${this.instanceName}`);
  }

}

/**
 * Amqp Original Channel Standard Data
 */
export class OriginalConfirmChannelWrapper {
  // logger
  private readonly logger: Logger;
  // amqp original channel instance
  public readonly channel: amqp.ConfirmChannel;
  // current amqp original channel service instance identify name
  public readonly instanceName: string;

  /**
   * Constructor
   *
   * @param confirmChannel amqp original confirm channel instance
   * @param {string} instanceName instance identify name
   */
  constructor(confirmChannel: amqp.ConfirmChannel, instanceName: string) {
    this.instanceName = instanceName;
    this.channel = confirmChannel;
    this.logger = LogFactory.create(instanceName.substr(0, this.instanceName.lastIndexOf('-')));
    this.logger.info(`Creating Channel Wrapper ${this.instanceName}`);
  }

  /**
   * Close current channel
   *
   * @return {Promise<void>}
   */
  public async close() {
    await this.channel.close();
    this.logger.warn(`Killed Channel ${this.instanceName}`);
  }

}

/**
 * Amqp Original Consumer Wrapper
 */
export class OriginalConsumerWrapper {
  // consumer identify
  public readonly consumerName: string;
  // prent channel service
  private readonly parentService: AmqpChannelService | AmqpConfirmChannelService;

  /**
   * Constructor
   *
   * @param {string} consumerName consumer identify
   * @param {AmqpChannelService} parentService parent channel service
   * @param {string} queue target queue
   * @param {(msg: (ConsumeMessage | null)) => void} processor message processor
   * @param {Options.Consume} options message receive option
   */
  constructor(
      consumerName: string,
      parentService: AmqpChannelService | AmqpConfirmChannelService,
      queue: string,
      processor: (msg: amqp.ConsumeMessage | null) => void,
      options?: Options.Consume,
  ) {
    this.consumerName = consumerName;
    this.parentService = parentService;
    this.parentService.logger.info(`Creating Consumer ${this.consumerName}`);
    const currentOptions = Object.assign({ consumerTag: consumerName }, options);
    this.parentService.currentChannelInstance.consume(queue, processor, currentOptions).catch(err => {
      this.parentService.logger.error(`Can't Create Consumer ${this.consumerName} Error: ${err.stack}`);
      throw err;
    });
  }

  /**
   * kill this consumer
   *
   * @return {Promise<void>} --
   */
  public async kill() {
    await this.parentService.currentChannelInstance.cancel(this.consumerName);
    this.parentService.logger.warn(`Killed Consumer ${this.consumerName}`);
  }

}

/**
 * Amqp Consumer Enhancer Wrapper
 */
export class EnhancerConsumerWrapper {
  // consumer identify
  public readonly consumerName: string;
  // prent channel service
  private readonly parentService: AmqpChannelService;
  // kill identify
  private killed: boolean = false;

  /**
   * Constructor
   *
   * @param {string} consumerName consumer identify
   * @param {AmqpChannelService} parentService parent channel service
   * @param {string} queue target queue
   * @param {(msg: (ConsumeMessage | null)) => void} processor message processor
   * @param {number} delay each message delay time (millisecond)
   * @param {Options.Consume} options message receive option
   */
  constructor(
      consumerName: string,
      parentService: AmqpChannelService,
      queue: string,
      processor: (msg: amqp.GetMessage) => void,
      delay: number,
      options?: Options.Get,
  ) {
    this.consumerName = consumerName;
    this.parentService = parentService;
    this.parentService.logger.info(`Creating Consumer ${this.consumerName}`);
    this.consumer(queue, processor, delay, options).catch(err => {
      this.parentService.logger.error(`Consumer ${this.consumerName} Got Some Error: ${err.stack}`);
    });
  }

  private async consumer(queue: string, processor: (msg: amqp.GetMessage) => void, delay = 0, options?: Options.Get) {
    if (this.killed) {
      this.parentService.logger.warn(`Killed Consumer ${this.consumerName}`);
      return;
    }
    // process message
    const message = await this.parentService.getCurrentMessage(queue, options);
    if (message) {
      processor(message);
    }
    await new Promise(r => setTimeout(r, delay));
    await this.consumer(queue, processor, delay, options);
  }

  /**
   * kill this enhancer consumer
   *
   * @return {Promise<void>} --
   */
  public async kill() {
    this.killed = true;
    await new Promise(r => setTimeout(r, 200));
  }

}

