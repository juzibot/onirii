import { AmqpChannelService } from '../../service/amqp/amqp-channel-service';
import { AmqpConfirmChannelService } from '../../service/amqp/amqp-confirm-channel-service';
import { OriginalChannelWrapper, OriginalConfirmChannelWrapper } from '../../wrapper/amqp-wapper';

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
   * @return {Promise<> | Promise<OriginalConfirmChannelWrapper>}
   */
  createChannelWrapper(confirmChannel: boolean): Promise<OriginalChannelWrapper | OriginalConfirmChannelWrapper | undefined>;

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
