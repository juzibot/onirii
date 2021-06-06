import * as amqp from 'amqplib';
import { Connection } from 'amqplib';
import { Options } from 'amqplib/properties';
import { Logger } from 'log4js';
import { LogFactory } from '../../factory/log-factory';
import { AmqpConnectInterface } from '../../interface/amqp/amqp-connect-interface';
import { EnvLoaderUtil } from '../../util/env-loader-util';
import { OriginalChannelWrapper, OriginalConfirmChannelWrapper } from '../../wrapper/amqp-wapper';
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
  public readonly currentAmqpServerUrl: string | Options.Connect | undefined;
  // current amqp connect service instance identify name
  public readonly instanceName: string;
  // connect max channel default 2048, this value can overwrite at env with MAX_CHANNEL_COUNT
  public readonly MAX_CHANNEL_COUNT: number = 2047;
  // connect channel pool
  private wrapperChannelPool: (OriginalChannelWrapper | OriginalConfirmChannelWrapper)[] = [];
  // connect channel service pool
  private serviceChannelPool: (AmqpChannelService | AmqpConfirmChannelService)[] = [];
  // channel position
  private channelPosition = -1;

  /**
   * Create a amqp connection service instance
   *
   * @param {string} name current server identify name (this name also extend to log config).
   * @param {string | Options.Connect} amqpUrl specific amqp url and it should include auth info,if is undefined will
   *                                           load from env.
   */
  constructor(name: string, amqpUrl?: string | Options.Connect) {
    this.instanceName = `${name}-amqp-service`;
    // init logger
    this.logger = LogFactory.create(this.instanceName);
    this.currentAmqpServerUrl = amqpUrl;
    // load amqp server url from public env file
    // this should always [=== undefined] do not change to [!this.currentAmqpServerUrl]
    if (this.currentAmqpServerUrl === undefined) {
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
    this.logger.debug(`Initialize ${this.instanceName} Creating Amqp Server: ${this.currentAmqpServerUrl}`);
    try {
      this.currentConnection = await amqp.connect(this.currentAmqpServerUrl!, options);
      this.logger.debug(`${this.instanceName} Connected Amqp Server: ${this.instanceName}`);
    } catch (err) {
      this.logger.error(`${this.instanceName} Connect Got Error: ${err.stack}`);
      throw err;
    }
  }

  /**
   * Create Amqp Channel Wrapper
   *
   * @param {'true' | 'false' | boolean} confirmChannel
   * @return {Promise<OriginalConfirmChannelWrapper | undefined>}
   */
  public async createChannelWrapper(confirmChannel: true): Promise<OriginalConfirmChannelWrapper | undefined>;
  public async createChannelWrapper(confirmChannel: false): Promise<OriginalChannelWrapper | undefined>;
  public async createChannelWrapper(confirmChannel: boolean): Promise<OriginalChannelWrapper | OriginalConfirmChannelWrapper | undefined> {
    // check exist channel count
    if (this.checkChannelCountOvered()) {
      return;
    }
    // create confirm channel wrapper
    if (confirmChannel) {
      const confirmChannel: OriginalConfirmChannelWrapper =
          new OriginalConfirmChannelWrapper(await this.currentConnection!.createConfirmChannel(), this.getNextChannelName());
      this.wrapperChannelPool.push(confirmChannel);
      return confirmChannel;
    }
    // create channel wrapper
    const channel: OriginalChannelWrapper =
        new OriginalChannelWrapper(await this.currentConnection!.createChannel(), this.getNextChannelName());
    this.wrapperChannelPool.push(channel);
    return channel;
  }


  /**
   * Create Amqp Channel Service
   *
   * @param {'true' | 'false' | boolean} confirmChannel
   * @return {Promise<AmqpConfirmChannelService | AmqpChannelService>}
   */
  public async createChannelService(confirmChannel: true): Promise<AmqpConfirmChannelService | undefined>;
  public async createChannelService(confirmChannel: false): Promise<AmqpChannelService | undefined>;
  public async createChannelService(confirmChannel: boolean): Promise<AmqpChannelService | AmqpConfirmChannelService | undefined> {
    // check exist channel count
    if (this.checkChannelCountOvered()) {
      return;
    }
    // create confirm channel service
    if (confirmChannel) {
      const confirmChannelService: AmqpConfirmChannelService =
          new AmqpConfirmChannelService(this.getNextChannelName(), await this.currentConnection!.createConfirmChannel());
      this.serviceChannelPool.push(confirmChannelService);
      return confirmChannelService;
    }
    // create channel service
    const channelService: AmqpChannelService =
        new AmqpChannelService(this.getNextChannelName(), await this.currentConnection!.createChannel());
    this.serviceChannelPool.push(channelService);
    return channelService;
  }

  /**
   * Kill current channel by name, this also will refresh pool content
   *
   * @param {string} channelName channel instance name
   * @return {Promise<void>}
   */
  public async killChannel(channelName: string): Promise<boolean> {
    // kill in service list
    let targetChannel: AmqpChannelService | AmqpConfirmChannelService | OriginalChannelWrapper | OriginalConfirmChannelWrapper | undefined;
    targetChannel = this.wrapperChannelPool.find(element => element.instanceName === channelName);
    if (targetChannel) {
      await targetChannel.close();
      this.serviceChannelPool = this.serviceChannelPool.filter(element => element.instanceName !== channelName);
      return true;
    }
    targetChannel = this.serviceChannelPool.find(element => element.instanceName === channelName);
    if (targetChannel) {
      await targetChannel.close();
      this.wrapperChannelPool = this.wrapperChannelPool.filter(element => element.instanceName !== channelName);
      return true;
    }
    this.logger.error(`Can't Kill Unknown Channel ${channelName}`);
    return false;
  }

  /**
   * Close connection also will close all channel in this connection
   *
   * @return {Promise<void>}
   */
  async close(): Promise<void> {
    await this.killWrapperChannel();
    await this.killServiceChannel();
    await this.currentConnection!.close();
    this.logger.warn(`Amqp Server Instance ${this.instanceName} Closed`);
  }

  /**
   * Kill current AmqpConnectService all wrapper channel
   * @return {Promise<void>}
   * @private
   */
  private async killWrapperChannel(): Promise<void> {
    for (let channelPoolElement of this.wrapperChannelPool) {
      await channelPoolElement.channel.close();
      this.logger.warn(`Killed Channel ${channelPoolElement.instanceName}`);
    }
  }

  /**
   * KIll current AmqpConnectService all service channel
   *
   * @return {Promise<void>}
   * @private
   */
  private async killServiceChannel(): Promise<void> {
    for (let channelPoolElement of this.serviceChannelPool) {
      await channelPoolElement.close();
      this.logger.warn(`Killed Channel ${channelPoolElement.instanceName}`);
    }
  }

  /**
   * Check channel count
   *
   * @return {Promise<boolean>}
   * @protected
   */
  private checkChannelCountOvered(): boolean {
    if (this.wrapperChannelPool.length + this.serviceChannelPool.length > this.MAX_CHANNEL_COUNT) {
      this.logger.error(`Can't Create New Channel, Active Channels Count Exceeds Total Connection Supports: MAX:${this.MAX_CHANNEL_COUNT}`);
      return true;
    }
    return false;
  }

  /**
   * Generate Next Channel Name
   *
   * @return {string} new channel name
   * @private --
   */
  private getNextChannelName(): string {
    this.channelPosition++;
    return `${this.instanceName}-channel-${this.channelPosition}`;
  }
}
