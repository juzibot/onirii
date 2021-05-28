import * as amqp from 'amqplib';
import { Connection } from 'amqplib';
import { LogFactory } from '../factory/log-factory';

/**
 * Amqp Server Connector
 *
 * @since 1.0.0
 * @date 2021-05-29
 * @author Luminous(BGLuminous)
 */
export class AmqpConnectUtil {
  /**
   * logger
   * @private
   */
  private static readonly logger = LogFactory.getLogger('base-service');

  /**
   * Create a Amqp connect
   * @param url amqp server url (this url should include auth info)
   * @param options connect options
   */
  public static async createConnect(url: string, options?: any): Promise<Connection> {
    this.logger.debug(`Creating Connection To Amqp Server: ${url} options: ${options || 'null'}`);
    if (options) {
      return await amqp.connect(url, options);
    }
    return await amqp.connect(url);
  }

}
