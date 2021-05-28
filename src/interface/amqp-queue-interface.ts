import { Options, Replies } from 'amqplib/properties';
import AssertQueue = Options.AssertQueue;

export interface AmqpQueueInterface {

  assertQueue(name: string, options?: AssertQueue): Promise<Replies.AssertQueue>,

  getQueueSimpleStatus(name: string): Promise<Replies.AssertQueue>,

  bindQueueExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty>;

  unbindQueueExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty>,

}
