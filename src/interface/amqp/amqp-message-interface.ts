import amqp from 'amqplib';
import { Options, Replies } from 'amqplib/properties';
import { AmqpChannelService } from '../../service/amqp/amqp-channel-service';
import { AmqpEnhancerConsumerWrapper } from '../../wrapper/amqp-enhancer-consumer-wrapper';
import { AmqpOriginalConsumerWrapper } from '../../wrapper/amqp-original-consumer-wrapper';

export interface AmqpMessageInterface {

  sendMessageToExchange(exchangeName: string, key: string, content: Buffer, options?: Options.Publish): Promise<boolean>;

  sendMessageToQueue(queueName: string, content: Buffer, options?: Options.Publish): Promise<boolean>;

  consume(queue: string, processor: (msg: amqp.ConsumeMessage | null) => void, options?: Options.Consume): AmqpOriginalConsumerWrapper;

  enhancerConsume(
      queue: string,
      processor: (msg: amqp.GetMessage, belongChannel: AmqpChannelService) => Promise<boolean | undefined>,
      delay: number,
      consumeName?: string,
      options?: Options.Get,
  ): AmqpEnhancerConsumerWrapper;

  killConsume(consumeTag: string): Promise<boolean>;

  getCurrentMessage(queueName: string, options?: Options.Get): Promise<false | amqp.GetMessage>;

  ackMessage(message: amqp.Message, allUp?: boolean): Promise<void>;

  ackAllMessage(): Promise<void>;

  rejectMessage(message: amqp.Message, allUp?: boolean, reQueue?: boolean): Promise<void>;

  nackAllMessage(reQueue?: boolean): Promise<void>;

  setPrefetchCount(count: number, global?: boolean): Promise<Replies.Empty>;

  recover(): Promise<Replies.Empty>;

}
