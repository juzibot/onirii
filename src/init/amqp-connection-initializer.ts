import amqp, { Connection } from 'amqplib';
import { PublicConfigLoader } from '../config/public-config-loader';
import { LogFactory } from '../factory/log-factory';
import { QueueEnum } from '../model/queue-enum';

/**
 * Amqp Connect Initializer
 *
 * @since 1.0.0
 * @data 2021-05-27
 * @author Luminous(BGLuminous)
 */
export class AmqpConnectionInitializer {
  // logger
  private static readonly logger = LogFactory.getLogger('amqp');

  /**
   * create a amqp connection instance
   *
   * @param name connect name (just for log)
   * @param queueType amqp queue type
   * @param url amqp server url
   * @param options connect options
   */
  public static async createAmqpConnection(name: string, queueType: QueueEnum, url?: string, options?: {}): Promise<Connection> {
    //verify current config or load config from args...
    let realAmqpServerUrl: string | undefined = url;
    if (!realAmqpServerUrl) {
      realAmqpServerUrl = PublicConfigLoader.getNecessaryConfig(name, queueType).apiUrl;
    }
    // create connection
    this.logger.debug(`Creating amqp connection name ${name}-${queueType} target url ${realAmqpServerUrl}`);
    if (!realAmqpServerUrl) {
      throw new Error('You must specific amqp server url defined in env or inject when call method');
    }
    try {
      if (options) {
        return await amqp.connect(realAmqpServerUrl, options);
      }
      return await amqp.connect(realAmqpServerUrl);
    } catch (err) {
      throw new Error(`Cant Initialize Amqp Instance ${name}-${queueType} target url ${realAmqpServerUrl}
      originError: ${err}`);
    }
  }

}