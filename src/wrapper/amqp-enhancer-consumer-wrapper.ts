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
  //
  private readonly consumeTargetQueue: string;
  // message processor
  private readonly processor: (msg: amqp.GetMessage, belongChannel: AmqpChannelService) => Promise<boolean | undefined>;
  // each message processed delay
  private readonly delay: number;
  // get message options
  private readonly options: Options.Get | undefined;
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
    delay = 10,
    options?: Options.Get,
  ) {
    this.consumerName = consumerName;
    this.parentService = parentService;
    this.parentService.logger.info(`Creating Consumer ${this.consumerName}`);
    this.consumeTargetQueue = queue;
    this.processor = processor;
    this.delay = delay < 10 ? 10 : delay;
    this.options = options;
    this.consumer().catch(err => {
      this.parentService.logger.error(`Consumer ${this.consumerName} Got Some Error: ${err.stack}`);
    });
  }

  /**
   * Consumer Simulator
   *
   * Note:: if message processor return true ,current channel will auto ack this message
   *
   */
  private async consumer(): Promise<void> {
    if (this.killed) {
      this.parentService.logger.warn(`Killed Consumer ${this.consumerName}`);
      return;
    }
    setInterval(() => {
      this.consumption();
    }, this.delay);
  }

  private async consumption() {
    const message = await this.parentService.getCurrentMessage(this.consumeTargetQueue, this.options);
    if (message) {
      const processResult = await this.processor(message, this.parentService);
      // if callback return true auto ack message
      if (processResult) {
        await this.parentService.ackMessage(message);
      }
    }
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
