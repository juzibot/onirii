import { Channel, Connection } from 'amqplib';
import { Logger } from 'log4js';
import { PublicConfigLoader } from '../config/public-config-loader';
import { AmqpQueueInterface } from '../interface/amqp-queue-interface';
import { PublicConfigModel } from '../model/public-config-model';
import { QueueEnum } from '../model/queue-enum';

/**
 *
 * @since 1.0.0
 * @date 2021-05-29
 * @author Luminous(BGLuminous)
 */
export class AmqpServiceImpl implements AmqpQueueInterface {
  // logger
  protected logger: Logger | undefined;
  // current amqp connect thi should not overwrite
  protected amqpInstance: Connection | undefined;
  // channel
  protected defaultChannel: Channel | undefined;

  // current service name
  protected readonly name: string;
  // current queue type
  protected readonly queueType: QueueEnum;
  // current instance url
  protected readonly url: string | undefined;
  // options
  protected readonly options: {} | undefined;
  // public config
  protected config: PublicConfigModel | undefined;

  /**
   *  loopStatusCheck: boolean
   * @param name
   * @param queueType
   * @param url
   * @param options
   */
  constructor(name: string, queueType: QueueEnum, url?: string, options?: {}) {
    if (!url) {
      this.config = PublicConfigLoader.getNecessaryConfig(name, queueType);
    }
    this.name = name;
    this.url = url ? url : this.config!.amqpUrl;
    this.options = options;
    this.queueType = queueType;
  }

  public async createCustomAmqpChannel(): Promise<Channel> {
    if (!this.amqpInstance || !this.logger) {
      throw new Error('You should init this instance first');
    }
    return await this.amqpInstance.createChannel();
  }


  protected verbose(part: string) {
    this.logger!.debug(`Instance ${this.name}-${this.queueType} ${part}`);
  }

  assertQueue(): void {
  }

  bindQueue(): void {
  }

  getQueueSimpleStatus(): void {
  }

  deleteQueue(): void {
  }

  purgeQueue(): void {
  }

  unbindQueue(): void {
  }

}
