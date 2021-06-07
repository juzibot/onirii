import * as amqp from 'amqplib';
import { Options } from 'amqplib/properties';
import { AmqpChannelService } from '../service/amqp/amqp-channel-service';
import { AmqpConfirmChannelService } from '../service/amqp/amqp-confirm-channel-service';

/**
 * Amqp Original Consumer Wrapper
 */
export class AmqpOriginalConsumerWrapper {
  // consumer identify
  public readonly consumerName: string;
  // prent channel service
  private readonly parentService: AmqpChannelService | AmqpConfirmChannelService;

  /**
   * Constructor
   *
   * @param {string} consumerName consumer identify
   * @param {AmqpChannelService} parentService parent channel service
   * @param {string} queue target queue
   * @param {(msg: (ConsumeMessage | null)) => void} processor message processor
   * @param {Options.Consume} options message receive option
   */
  constructor(
    consumerName: string,
    parentService: AmqpChannelService | AmqpConfirmChannelService,
    queue: string,
    processor: (msg: amqp.ConsumeMessage | null) => void,
    options?: Options.Consume,
  ) {
    this.consumerName = consumerName;
    this.parentService = parentService;
    this.parentService.logger.info(`Creating Consumer ${this.consumerName}`);
    const currentOptions = Object.assign({ consumerTag: consumerName }, options);
    this.parentService.currentChannelInstance.consume(queue, processor, currentOptions).catch(err => {
      this.parentService.logger.error(`Can't Create Consumer ${this.consumerName} Error: ${err.stack}`);
      throw err;
    });
  }

  /**
   * kill this consumer
   *
   * @return {Promise<void>} --
   */
  public async kill(): Promise<void> {
    await this.parentService.currentChannelInstance.cancel(this.consumerName);
    this.parentService.logger.warn(`Killed Consumer ${this.consumerName}`);
  }

}
