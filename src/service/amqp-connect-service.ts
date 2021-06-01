import * as amqp from 'amqplib';
import { Connection } from 'amqplib';
import { Options } from 'amqplib/properties';
import { Logger } from 'log4js';
import { LogFactory } from '../factory/log-factory';
import { AmqpConnectInterface } from '../interface/amqp/amqp-connect-interface';
import { EnvLoaderUtil } from '../util/env-loader-util';
import { AmqpChannelService } from './amqp-channel-service';
import { AmqpConfirmChannelService } from './amqp-confirm-channel-service';

/**
 * Amqp Connect Server For Create Connect
 *
 * @since 1.0.0
 * @date 2021-06-01
 * @author Luminous(BGLuminous)
 */
export class AmqpConnectService implements AmqpConnectInterface {
  // logger
  private readonly logger: Logger;
  // current server connect
  public currentConnection: Connection | undefined;
  // current connect amqp server
  public readonly currentAmqpServerUrl: string | undefined;
  // current amqp service instance identify name
  public readonly currentAmqpServiceName: string;
  // connect max channel default 2048, this value can overwrite at env with MAX_CHANNEL_COUNT
  private readonly MAX_CHANNEL_COUNT = 2048;
  // connect original channel pool
  private channelPool: amqp.Channel[];
  // connect original confirm chaneel pool
  private conirmChannelPool: amqp.ConfirmChannel[];
  // connect channel pool
  private channelServicePool: AmqpChannelService[];
  // connect confirm channel pool
  private confirmChannelServicePool: AmqpConfirmChannelService[];

  /**
   * Create a amqp connection service instance
   *
   * @param {string} name current server identify name (this name also extend to log config).
   * @param {string | Options.Connect} amqpUrl specific amqp url and it should include auth info,if is undefined will
   *                                           load from env.
   */
  constructor(name: string, amqpUrl?: string | Options.Connect) {
    this.currentAmqpServiceName = `${name}-amqp-service`;
    // init logger
    this.logger = LogFactory.create(this.currentAmqpServiceName);
    // load amqp server url from public env file
    if (!amqpUrl) {
      this.currentAmqpServerUrl = EnvLoaderUtil.GetInstance().getPublicConfig().amqpServerUrl;
    }
    // check
    if (!this.currentAmqpServerUrl) {
      throw new Error('Must Specific Amqp Server Url');
    }
  }

  /**
   * Initialize Current Connection, if got connect error throw Error
   *
   * @param options socket custom options
   */
  public async ready(options?: any): Promise<void> {
    this.logger.debug(`Initialize ${this.currentAmqpServiceName} Creating Amqp Server: ${this.currentAmqpServiceName}`);
    try {
      this.currentConnection = await amqp.connect(this.currentAmqpServerUrl!, options);
      this.logger.debug(`${this.currentAmqpServiceName} Connected Amqp Server: ${this.currentAmqpServiceName}`);
    } catch (err) {
      this.logger.error(`${this.currentAmqpServiceName} Connect Got Error: ${err.stack}`);
      throw err;
    }
  }

  /**
   * Create a normal channel
   *
   * @return {Promise<any>}
   */
  async createChannel(): Promise<AmqpChannelService | undefined> {
    if (!await this.checkChannelCount()) {
      const channel = await this.currentConnection!.createChannel();
      this.channelPool.push(channel);
      return channel;
    } else {
      this.logger.error(`Active Channels Count Exceeds Total Connection Supports: MAX:${this.MAX_CHANNEL_COUNT}`);
      return;
    }
  }

  /**
   * Create a confirm channel
   *
   * @return {Promise<void>}
   */
  async createConfirmChannel(): Promise<amqp.ConfirmChannel> {
    if (this.MAX_CHANNEL_COUNT) {

    }
    return await this.currentConnection!.createConfirmChannel();
  }

  /**
   * Close connection
   * @return {Promise<void>}
   */
  async close(): Promise<void> {
    await this.currentConnection!.close();
  }

  private async checkChannelCount(): Promise<boolean> {
    const totalOpenChannelCount = this.channelPool.length + this.conirmChannelPool.length
        + this.channelServicePool.length + this.confirmChannelServicePool.length;
    return totalOpenChannelCount < this.MAX_CHANNEL_COUNT;
  }

}
