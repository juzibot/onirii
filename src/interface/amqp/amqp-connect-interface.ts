import * as amqp from 'amqplib';
import { AmqpChannelService } from '../../service/amqp-channel-service';
import { AmqpConfirmChannelService } from '../../service/amqp-confirm-channel-service';

export interface AmqpConnectInterface {

  createChannel(): Promise<amqp.Channel | undefined>;

  createConfirmChannel(): Promise<amqp.ConfirmChannel | undefined>;

  createChannelService(): Promise<AmqpChannelService | undefined>;

  createConfirmChannelService(): Promise<AmqpConfirmChannelService | undefined>;

  close(): Promise<void>;

}
