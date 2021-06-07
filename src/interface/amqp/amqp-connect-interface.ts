import { AmqpChannelService } from '../../service/amqp/amqp-channel-service';
import { AmqpConfirmChannelService } from '../../service/amqp/amqp-confirm-channel-service';
import { AmqpOriginalChannelWrapper } from '../../wrapper/amqp-original-channel-wrapper';
import { AmqpOriginalConfirmChannelWrapper } from '../../wrapper/amqp-original-confirm-channel-wrapper';

/**
 * Amqp Connect Service Interface
 *
 * @since 1.0.0
 * @date 2021-06-01
 * @author Luminous(BGLuminous)
 */
export interface AmqpConnectInterface {

  /**
   * Create Original Channel Wrapper
   *
   * @param {boolean} confirmChannel confirmChannel?
   * @return {Promise<> | Promise<AmqpOriginalChannelWrapper | AmqpOriginalConfirmChannelWrapper>}
   */
  createChannelWrapper(confirmChannel: boolean): Promise<AmqpOriginalChannelWrapper | AmqpOriginalConfirmChannelWrapper | undefined>;

  /**
   * Create Amqp Channel Service
   *
   * @param {boolean} confirmChannel confirmChannelService?
   * @return {Promise<AmqpChannelService> | Promise<AmqpConfirmChannelService>}
   */
  createChannelService(confirmChannel: boolean): Promise<AmqpChannelService | AmqpConfirmChannelService | undefined>;

  /**
   * Close Current Amqp Service Connection
   *
   * @return {Promise<void>}
   */
  close(): Promise<void>;
}
