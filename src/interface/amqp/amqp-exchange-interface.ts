import { Options } from 'amqplib';
import { Replies } from 'amqplib/properties';

export interface AmqpExchangeInterface {

  createExchangeIfNotExist(name: string, type: string, options?: Options.AssertExchange): Promise<Replies.AssertExchange>;

  getExchangeStatus(name: string): Promise<Replies.Empty>;

  deleteExchange(name: string, options?: Options.DeleteExchange): Promise<Replies.Empty>;

  bindExchangeToExchange(target: string, from: string, key: string, args?: any): Promise<Replies.Empty>;

  unbindExchangeToExchange(target: string, from: string, key: string, args?: any): Promise<Replies.Empty>;

}
