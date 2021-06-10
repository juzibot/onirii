import * as amqp from 'amqplib';
import { Logger } from 'log4js';
import { LogFactory } from '../factory/log-factory';

/**
 * Amqp Original Channel Standard Data
 */
export class AmqpOriginalConfirmChannelWrapper {
  // amqp original channel instance
  public readonly channel: amqp.ConfirmChannel;
  // current amqp original channel service instance identify name
  public readonly instanceName: string;
  // logger
  private readonly logger: Logger;

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
