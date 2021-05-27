import * as amqp from 'amqplib';
import { Connection } from 'amqplib';
import { LogFactory } from '../factory/log-factory';

export class AmqpConnectUtil {
  // logger
  private static readonly logger = LogFactory.getLogger('amqp');

  public static async getConnect(url: string, options?: {}): Promise<Connection> {
    this.logger.debug(`Creating Connection To url: ${url} type`);
    if (options) {
      return await amqp.connect(url, options);
    }
    return await amqp.connect(url);
  }

  public static async getChannel(url: string, options?: {}) {
    const con = await this.getConnect(url, options);
    return con.createChannel();
  }

}