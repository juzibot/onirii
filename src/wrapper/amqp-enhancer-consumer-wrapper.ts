import * as amqp from 'amqplib';
import { Options } from 'amqplib/properties';
import { AmqpChannelService } from '../service/amqp/amqp-channel-service';

/**
 * Amqp Consumer Enhancer Wrapper
 */
export class AmqpEnhancerConsumerWrapper {
  // consumer identify
  public readonly consumerName: string;
  // prent channel service
  private readonly parentService: AmqpChannelService;
  // kill identify
  private killed: boolean = false;

  /**
   * Constructor
   *
   * Note:: if message processor return true ,current channel will auto ack this message
   *
   * @param {string} consumerName consumer identify
   * @param {AmqpChannelService} parentService parent channel service
   * @param {string} queue target queue
   * @param processor message processor
   * @param {number} delay each message delay time (millisecond)
   * @param {Options.Consume} options message receive option
   */
  constructor(
    consumerName: string,
    parentService: AmqpChannelService,
    queue: string,
    processor: (msg: amqp.GetMessage, belongChannel: AmqpChannelService) => Promise<boolean | undefined>,
    delay: number,
    options?: Options.Get,
  ) {
    this.consumerName = consumerName;
    this.parentService = parentService;
    this.parentService.logger.info(`Creating Consumer ${this.consumerName}`);
    this.consumer(queue, processor, delay, options).catch(err => {
      this.parentService.logger.error(`Consumer ${this.consumerName} Got Some Error: ${err.stack}`);
    });
  }

  /**
   * Consumer Simulator
   *
   * Note:: if message processor return true ,current channel will auto ack this message
   *
   * @param {string} queue target queue
   * @param {(msg: GetMessage, belongChannel: AmqpChannelService) => Promise<boolean>} processor message processor
   * @param {number} delay each message processed delay
   * @param {Options.Get} options get message options
   * @return {Promise<void>}
   * @private
   */
  private async consumer(
    queue: string,
    processor: (msg: amqp.GetMessage, belongChannel: AmqpChannelService) => Promise<boolean | undefined>,
    delay: number = 0,
    options?: Options.Get,
  ): Promise<void> {
    if (this.killed) {
      this.parentService.logger.warn(`Killed Consumer ${this.consumerName}`);
      return;
    }
    await new Promise(async () => {
      // process message
      const message = await this.parentService.getCurrentMessage(queue, options);
      if (message) {
        const processResult = await processor(message, this.parentService);
        // if callback return true auto ack message
        if (processResult) {
          await this.parentService.ackMessage(message);
        }
      }
    });
    await new Promise(r => setTimeout(r, delay));
    await this.consumer(queue, processor, delay, options);
  }

  /**
   * kill this enhancer consumer
   *
   * @return {Promise<void>} --
   */
  public async kill(): Promise<void> {
    this.killed = true;
  }

}
