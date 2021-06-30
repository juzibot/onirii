import { AmqpChannelNamespace } from '../../model/amqp/amqp-channel-namespace';

/**
 * Amqp Extra Operator Interface
 *
 * @since 1.3.0
 * @date 2021-06-30
 * @author Luminous(BGLuminous)
 */
export interface AmqpExtraInterface {

  initMetaConfigure(config: AmqpChannelNamespace.MetaConfigure): Promise<void>;

  initQueueConfigure(config: AmqpChannelNamespace.AmqpQueue[], cleanMode: boolean): Promise<void>;

  initExchangeConfigure(config: AmqpChannelNamespace.AmqpExchange[], cleanMode: boolean): Promise<void>;

  initBindConfigure(config: AmqpChannelNamespace.AmqpBind[]): Promise<void>;

}
