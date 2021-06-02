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
  public readonly MAX_CHANNEL_COUNT: number = 2047;
  // connect channel pool
  public channelPool: channelListType[] = [];

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
      this.currentAmqpServerUrl = EnvLoaderUtil.getInstance().getPublicConfig().amqpServerUrl;
    }
    // load max channel count if configured
    const maxChannelCount = EnvLoaderUtil.getInstance().getPublicConfig().maxChannelCount;
    if (maxChannelCount && !isNaN(maxChannelCount)) {
      this.MAX_CHANNEL_COUNT = maxChannelCount;
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
  async createChannel(): Promise<amqp.Channel | undefined> {
    if (await this.checkChannelCount()) {
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
  async createConfirmChannel(): Promise<amqp.ConfirmChannel | undefined> {
    if (await this.checkChannelCount()) {
      const confirmChannel = await this.currentConnection!.createConfirmChannel();
      this.channelPool.push(confirmChannel);
      return confirmChannel;
    } else {
      this.logger.error(`Active Channels Count Exceeds Total Connection Supports: MAX:${this.MAX_CHANNEL_COUNT}`);
      return;
    }
  }

  /**
   * Create a channel service
   *
   * @return {Promise<AmqpChannelService | undefined>}
   */
  async createChannelService(): Promise<AmqpChannelService | undefined> {
    if (await this.checkChannelCount()) {
      const channel = await this.currentConnection!.createChannel();
      const channelService = new AmqpChannelService(this.currentAmqpServiceName, channel);
      this.channelPool.push(channelService);
      return channelService;
    } else {
      this.logger.error(`Active Channels Count Exceeds Total Connection Supports: MAX:${this.MAX_CHANNEL_COUNT}`);
      return;
    }
  }

  /**
   * Create confirm channel service
   *
   * @return {Promise<AmqpConfirmChannelService | undefined>}
   */
  async createConfirmChannelService(): Promise<AmqpConfirmChannelService | undefined> {
    if (await this.checkChannelCount()) {
      const confirmChannel = await this.currentConnection!.createConfirmChannel();
      const confirmChannelService = new AmqpConfirmChannelService(this.currentAmqpServiceName, confirmChannel);
      this.channelPool.push(confirmChannelService);
      return confirmChannelService;
    } else {
      this.logger.error(`Active Channels Count Exceeds Total Connection Supports: MAX:${this.MAX_CHANNEL_COUNT}`);
      return;
    }
  }

  /**
   * Close connection this will close all channel in this connection
   *
   * @return {Promise<void>}
   */
  async close(): Promise<void> {
    await this.currentConnection!.close();
  }

  /**
   * Check channel count
   *
   * @return {Promise<boolean>}
   * @protected
   */
  protected async checkChannelCount(): Promise<boolean> {
    return this.channelPool.length < this.MAX_CHANNEL_COUNT;
  }

}

type channelListType = amqp.Channel | amqp.ConfirmChannel | AmqpChannelService | AmqpConfirmChannelService;
