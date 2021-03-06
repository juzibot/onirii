import * as amqp from 'amqplib';
import { Connection } from 'amqplib';
import { Options } from 'amqplib/properties';
import { Logger } from 'log4js';
import { LogFactory } from '../../factory/log-factory';
import { AmqpConnectInterface } from '../../interface/amqp/amqp-connect-interface';
import { EnvLoaderUtil } from '../../util/env-loader-util';
import { AmqpOriginalChannelWrapper } from '../../wrapper/amqp-original-channel-wrapper';
import { AmqpOriginalConfirmChannelWrapper } from '../../wrapper/amqp-original-confirm-channel-wrapper';
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
  // current server connect
  public currentConnection: Connection | undefined;
  // current connect amqp server
  public readonly currentAmqpServerUrl: string | Options.Connect = '';
  // current amqp connect service instance identify name
  public readonly instanceName: string;
  // connect max channel default 2048, this value can overwrite at env with MAX_CHANNEL_COUNT
  public readonly MAX_CHANNEL_COUNT: number = 2047;
  // logger
  private readonly logger: Logger;
  // connect channel pool
  private wrapperChannelPool: (AmqpOriginalChannelWrapper | AmqpOriginalConfirmChannelWrapper)[] = [];
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
    this.instanceName = `${ name }-amqp-connect`;
    // init logger
    this.logger = LogFactory.create(this.instanceName);
    if (amqpUrl) {
      this.currentAmqpServerUrl = amqpUrl;
    }
    // load amqp server url from public env file
    if (!this.currentAmqpServerUrl) {
      const loadFromEnv = EnvLoaderUtil.getInstance().getPublicConfig().amqpServerUrl;
      if (loadFromEnv) {
        this.currentAmqpServerUrl = loadFromEnv;
      }
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
   * @param init init callback after connect succeed
   * @param retry connect retry times if set -1 this connect will not re-connect
   * @param options socket custom options
   */
  public async ready(init?: (instance: this) => void, retry = 0, options?: any): Promise<void> {
    const retryInfo = retry > 0 ? `Retry: ${ retry } times` : '';
    this.logger.debug(
      `Initialize ${ this.instanceName } Creating Amqp Server: ${ this.currentAmqpServerUrl } ${ retryInfo }`,
    );
    try {
      await this.close();
      // @ts-ignore
      this.currentConnection = await amqp.connect(this.currentAmqpServerUrl, options, (err) => {
        this.logger.error(`Connection(${this.instanceName}) Connecting Server Got Error: ${err}`);
        throw new Error(err);
      });
      this.addDefaultListener();
      this.logger.debug(`${ this.instanceName } Connected Amqp Server`);
      if ((init)) {
        init(this);
      }
    } catch (err) {
      this.logger.error(`${ this.instanceName } Connect Got Error: ${ err.stack }`);
      if (retry >= 0 && EnvLoaderUtil.getInstance().getPublicConfig().autoReconnect) {
        await new Promise(r => setTimeout(r, 5 * 1000));
        await this.ready(init, ++retry, options);
      }
      throw err;
    }
  }

  /**
   * Add default listener for each connect service instance
   *
   * @private
   */
  private addDefaultListener() {
    this.addErrorListener((err) => {
      this.logger.error(`Amqp Connect(${this.instanceName}) Got Error: ${ err } ${ JSON.stringify(err) }`);
    });
    this.addCloseListener((err) => {
      this.logger.error(`Amqp Connect(${this.instanceName}) Closed: ${ err } ${ JSON.stringify(err) }`);
    });
  }

  /**
   * add close event listener
   *
   * @param process event emit callback
   */
  public addCloseListener(process: (err: any) => void) {
    this.currentConnection?.on('close', err => {
      process(err);
    });
  }

  /**
   * add error event listener
   *
   * @param process event emit callback
   */
  public addErrorListener(process: (err: any) => void) {
    this.currentConnection?.on('error', err => process(err));
  }

  /**
   * Kill current channel by name, this also will refresh pool content
   *
   * @param {string} channelName channel instance name
   * @return {Promise<void>}
   */
  public async killChannel(channelName: string): Promise<boolean> {
    // kill in service list
    let targetChannel: AmqpChannelService | AmqpConfirmChannelService | AmqpOriginalChannelWrapper | AmqpOriginalConfirmChannelWrapper | undefined;
    targetChannel = this.serviceChannelPool.find(element => element.instanceName === channelName);
    if (targetChannel) {
      this.serviceChannelPool = this.serviceChannelPool.filter(element => element.instanceName !== channelName);
      return true;
    }
    targetChannel = this.wrapperChannelPool.find(element => element.instanceName === channelName);
    if (targetChannel) {
      await targetChannel.close();
      this.wrapperChannelPool = this.wrapperChannelPool.filter(element => element.instanceName !== channelName);
      return true;
    }
    this.logger.error(`Can't Kill Unknown Channel ${ channelName }`);
    return false;
  }

  /**
   * Close connection also will close all channel in this connection
   *
   * @return {Promise<void>}
   */
  async close(init = true): Promise<void> {
    try {
      if (!this.currentConnection) {
        this.logger.warn('Please ready this connection first');
      }
      await this.killWrapperChannel();
      await this.killServiceChannel();
      await this.currentConnection?.close();
      this.logger.warn(`Amqp Server Instance ${ this.instanceName } Closed`);
    }catch (err){
      if(!init){
        this.logger.warn(`Cant Close Instance ${ this.instanceName } Closed`);
      }
    }
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
    if (!this.currentConnection) {
      throw new Error('Please ready this connection first');
    }
    // check exist channel count
    if (this.checkChannelCountOvered()) {
      return;
    }
    // create confirm channel service
    if (confirmChannel) {
      const confirmChannelService: AmqpConfirmChannelService =
        new AmqpConfirmChannelService(this.getNextChannelName(), await this.currentConnection.createConfirmChannel());
      this.serviceChannelPool.push(confirmChannelService);
      return confirmChannelService;
    }
    // create channel service
    const channelService: AmqpChannelService =
      new AmqpChannelService(this.getNextChannelName(), await this.currentConnection.createChannel());
    this.serviceChannelPool.push(channelService);
    return channelService;
  }

  /**
   * Create Amqp Channel Wrapper
   *
   * @param {'true' | 'false' | boolean} confirmChannel
   * @return {Promise<AmqpOriginalConfirmChannelWrapper | undefined>}
   */
  public async createChannelWrapper(confirmChannel: true): Promise<AmqpOriginalConfirmChannelWrapper | undefined>;
  public async createChannelWrapper(confirmChannel: false): Promise<AmqpOriginalChannelWrapper | undefined>;
  public async createChannelWrapper(confirmChannel: boolean): Promise<AmqpOriginalChannelWrapper | AmqpOriginalConfirmChannelWrapper | undefined> {
    if (!this.currentConnection) {
      throw new Error('Please ready this connection first');
    }
    // check exist channel count
    if (this.checkChannelCountOvered()) {
      return;
    }
    // create confirm channel wrapper
    if (confirmChannel) {
      const confirmChannelInstance: AmqpOriginalConfirmChannelWrapper =
        new AmqpOriginalConfirmChannelWrapper(await this.currentConnection.createConfirmChannel(), this.getNextChannelName());
      this.wrapperChannelPool.push(confirmChannelInstance);
      return confirmChannelInstance;
    }
    // create channel wrapper
    const channelInstance: AmqpOriginalChannelWrapper =
      new AmqpOriginalChannelWrapper(await this.currentConnection.createChannel(), this.getNextChannelName());
    this.wrapperChannelPool.push(channelInstance);
    return channelInstance;
  }

  /**
   * Kill current AmqpConnectService all wrapper channel
   * @return {Promise<void>}
   * @private
   */
  private async killWrapperChannel(): Promise<void> {
    for (const channelPoolElement of this.wrapperChannelPool) {
      await channelPoolElement.channel.close();
      this.logger.warn(`Killed Channel ${ channelPoolElement.instanceName }`);
    }
  }

  /**
   * KIll current AmqpConnectService all service channel
   *
   * @return {Promise<void>}
   * @private
   */
  private async killServiceChannel(): Promise<void> {
    await Promise.all(this.serviceChannelPool.map(element => element.close()));
  }

  /**
   * Check channel count
   *
   * @return {Promise<boolean>}
   * @protected
   */
  private checkChannelCountOvered(): boolean {
    if (this.wrapperChannelPool.length + this.serviceChannelPool.length > this.MAX_CHANNEL_COUNT) {
      this.logger.error(`Can't Create New Channel, Active Channels Count Exceeds Total Connection Supports: MAX:${ this.MAX_CHANNEL_COUNT }`);
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
    return `${ this.instanceName }-channel-${ this.channelPosition }`;
  }
}
