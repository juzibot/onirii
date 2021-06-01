import { Options } from 'amqplib';

export interface OriginalMessageInterface{

  sendMessage(targetQueueOrExchange: string, key: string, message: any, options: messageOptions): Promise<sendMessageRsType>;

  sendMessageBatch<T>(): T;

  receiveMessage<T>(): T;

  deleteMessage<T>(): T;

  deleteMessageBatch<T>(): T;

  changeMessageVisibility<T>(): T;

  changeMessageVisibilityBatch<T>(): T;
}

type messageOptions = Options.Publish;

type sendMessageRsType = boolean;
