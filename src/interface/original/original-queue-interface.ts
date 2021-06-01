import { Options } from 'amqplib';
import { Replies } from 'amqplib/properties';

export interface OriginalQueueInterface{

  createQueue(): void;

  getQueue(): void;

  deleteQueue(name: string, options: Options.DeleteQueue): Promise<deleteQueueRsType>;

  purgeQueue(name: string): Promise<purgeQueueRsType>;

}

type deleteQueueRsType = Replies.DeleteQueue;

type purgeQueueRsType = Replies.PurgeQueue;
