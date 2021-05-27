import amqp, { Connection } from 'amqplib';
import { LogFactory } from '../factory/log-factory';

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
   * @param url amqp server url
   * @param options connect options
   */
  public static async createAmqpConnection(name: string, url?: string, options?: {}): Promise<Connection> {
    this.logger.debug(`Creating amqp connection name ${name} target url ${url}`);
    const target: string | undefined = url || process.env.AMQP_URL;
    if (!target) {
      throw new Error('You must specific ');
    }
    try {
      if (options) {
        return await amqp.connect(target, options);
      }
      return await amqp.connect(target);
    } catch (err) {
      throw new Error(`Cant Initialize Amqp Instance ${name} target url ${url}`);
    }
  }

}