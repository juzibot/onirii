import amqp from 'amqplib';
import { Options, Replies } from 'amqplib/properties';
import { AmqpConfirmChannelInterface } from '../../interface/amqp/amqp-confirm-channel-interface';
import { AmqpChannelService } from './amqp-channel-service';

/**
 * Confirm Channel Service
 *
 * @since 1.0.0
 * @date 2021-06-02
 * @author Luminous
 */
export class AmqpConfirmChannelService extends AmqpChannelService implements AmqpConfirmChannelInterface {

  constructor(name: string, currentConfirmChannel: amqp.ConfirmChannel) {
    super(name, currentConfirmChannel);
  }

  async sendMessageToExchange(
    exchangeName: string,
    key: string,
    content: Buffer,
    options?: Options.Publish,
    callback?: (err: any, ok: Replies.Empty) => void,
  ): Promise<boolean> {
    return this.currentChannelInstance.publish(exchangeName, key, content, options, callback);
  }

  async sendMessageToQueue(
    queueName: string,
    content: Buffer,
    options?: Options.Publish,
    callback?: (err: any, ok: Replies.Empty) => void,
  ): Promise<boolean> {
    return this.currentChannelInstance.sendToQueue(queueName, content, options, callback);
  }

  async waitForConfirms(): Promise<void> {
    if ('waitForConfirms' in this.currentChannelInstance) {
      return this.currentChannelInstance.waitForConfirms();
    }
    throw new Error(`This Error Should Not Happened Current Channel: ${ this.currentChannelInstance }`);
  }

}
