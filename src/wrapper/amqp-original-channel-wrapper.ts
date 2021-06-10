import * as amqp from 'amqplib';
import { Logger } from 'log4js';
import { LogFactory } from '../factory/log-factory';

/**
 * Amqp Original Channel Standard Data
 */
export class AmqpOriginalChannelWrapper {
  // amqp original channel instance
  public readonly channel: amqp.Channel;
  // current amqp original channel service instance identify name
  public readonly instanceName: string;
  // logger
  private readonly logger: Logger;

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
    this.logger.info(`Creating Channel Wrapper ${ this.instanceName }`);
  }

  /**
   * Close current channel
   *
   * @return {Promise<void>}
   */
  public async close(): Promise<void> {
    await this.channel.close();
    this.logger.warn(`Killed Channel ${ this.instanceName }`);
  }

}
