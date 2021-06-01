import * as amqp from 'amqplib';
import { AmqpChannelService } from '../../service/amqp-channel-service';
import { AmqpConfirmChannelService } from '../../service/amqp-confirm-channel-service';

export interface AmqpConnectInterface {

  createChannel(): Promise<AmqpChannelService | undefined>;

  createConfirmChannel(): Promise<amqp.ConfirmChannel>;

  createChannelService(): Promise<AmqpChannelService>;

  createConfirmChannelService(): Promise<AmqpConfirmChannelService>;

  close(): Promise<void>;

}
