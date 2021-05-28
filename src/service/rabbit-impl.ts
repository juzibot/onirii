import { PublicConfigLoader } from '../config/public-config-loader';
import { LogFactory } from '../factory/log-factory';
import { AmqpConnectionInitializer } from '../init/amqp-connection-initializer';
import { QueueEnum } from '../model/queue-enum';
import { AmqpServiceImpl } from './amqp-service-impl';

export class RabbitImpl extends AmqpServiceImpl {

  // current instance api url
  protected readonly api: string | undefined;

  protected readonly auth: string | undefined;

  /**
   *  loopStatusCheck: boolean
   * @param name
   * @param url
   * @param api
   * @param auth
   * @param options
   */
  constructor(name: string, url?: string, api?: string, auth?: string, options?: {}) {
    super(name, QueueEnum.RABBIT, url, options);
    LogFactory.flush(`${name}-${this.queueType}`);
    this.logger = LogFactory.getLogger(`${this.name}-${this.queueType}`);
    if (!api && !this.config) {
      this.config = PublicConfigLoader.getNecessaryConfig(name, QueueEnum.RABBIT);
    }
    this.api = api ? api : this.config!.apiUrl;
    this.auth = auth ? Buffer.from(auth).toString('base64') : Buffer.from(<string>this.config!.apiAuth).toString('base64');
    this.logger.debug(this.auth);
  }

  /**
   * init instance got all status ready
   */
  public async init() {
    if (this.amqpInstance !== undefined) {
      this.logger!.warn(`Amqp Instance ${this.name} Already initialized Passing Operation`);
    }
    this.amqpInstance = await AmqpConnectionInitializer.createAmqpConnection(this.name, this.queueType, this.url, this.options);
    this.defaultChannel = await this.amqpInstance.createChannel();
    this.check();
  }

  private check() {
    if (!this.url || !this.api || !this.amqpInstance || !this.defaultChannel) {
      throw new Error(`init missing some necessary props:
          url: ${this.url} api: ${this.api} amqp: ${this.amqpInstance} channel: ${this.defaultChannel}`);
    }
  }

}
