import * as amqp from 'amqplib';
import { Logger } from 'log4js';
import { LogFactory } from '../factory/log-factory';

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
   * @param {Channel} channel amqp original channel instance
   * @param {string} instanceName instance identify name
   */
  constructor(channel: amqp.Channel, instanceName: string) {
    this.channel = channel;
    this.instanceName = instanceName;
    this.logger = LogFactory.create(instanceName.substr(0, this.instanceName.lastIndexOf('-')));
    this.logger.info(`Creating Channel Wrapper ${this.instanceName}`);
  }

  public async close() {
    this.logger.warn(`Killing Channel ${this.instanceName}`);
    await this.channel.close();
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
   * @param confirmChannel amqp original confirm channel instance
   * @param {string} instanceName instance identify name
   */
  constructor(confirmChannel: amqp.ConfirmChannel, instanceName: string) {
    this.instanceName = instanceName;
    this.channel = confirmChannel;
    this.logger = LogFactory.create(instanceName.substr(0, this.instanceName.lastIndexOf('-')));
    this.logger.info(`Creating Channel Wrapper ${this.instanceName}`);
  }

  public async close() {
    this.logger.warn(`Killing Channel ${this.instanceName}`);
    await this.channel.close();
  }

}

