import { Options, Replies } from 'amqplib/properties';

export interface AmqpQueueInterface {

  assertQueue(name: string, options?: Options.AssertQueue): Promise<Replies.AssertQueue>,

  getQueueStatus(name: string): Promise<Replies.AssertQueue>,

  bindQueueToExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty>;

  unbindQueueToExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty>,

}
