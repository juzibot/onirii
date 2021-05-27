import AWS from 'aws-sdk';
import {
  CreateQueueRequest,
  CreateQueueResult,
  DeleteQueueRequest,
  GetQueueAttributesRequest,
  GetQueueAttributesResult,
  GetQueueUrlRequest,
  GetQueueUrlResult,
  ListQueuesResult,
  PurgeQueueRequest,
  SetQueueAttributesRequest,
} from 'aws-sdk/clients/sqs';
import { AWSError } from 'aws-sdk/lib/error';
import { Request } from 'aws-sdk/lib/request';
import { Logger } from 'log4js';
import { LogFactory } from '../factory/log-factory';
import SqsInstanceInitializer from '../init/sqs-instance-initializer';
import MessageAdapter from '../interface/message-adapter';
import OtherAdapter from '../interface/other-adapter';
import PermissionAdapter from '../interface/permission-adapter';
import QueueAdapter from '../interface/queue-adapter';
import TagAdapter from '../interface/tag-adapter';
import { QueueEnum } from '../model/queue-enum';

/**
 * Amazon SQS queue Implementation class
 *
 * @since 1.0.0
 * @date 2021-05-26
 * @author Luminous(BGLuminous)
 */
export class SqsQueueImpl implements QueueAdapter, MessageAdapter, PermissionAdapter, TagAdapter, OtherAdapter {
  // logger
  private readonly logger: Logger;
  // current queue
  private readonly currentQueue: AWS.SQS;
  // instance name
  private readonly name: string;

  /**
   * Constructor
   *
   * @param specificMode
   * @param name instance name
   * @param customConfig
   */
  public constructor(specificMode = false, name: string, customConfig?: AWS.SQS.ClientConfiguration) {
    this.currentQueue = new SqsInstanceInitializer(specificMode, customConfig).getSqs();
    this.name = name;
    LogFactory.flush(`${QueueEnum.SQS}-${name}`);
    this.logger = LogFactory.getLogger(QueueEnum.SQS);
  }

  creatQueue(params: CreateQueueRequest, callback?: (err: AWSError, data: CreateQueueResult) => void):
      Request<CreateQueueResult, AWSError> {
    this.logger.debug(`instance ${this.name} createQueue() invoked with params:${JSON.stringify(params)}`);
    return this.currentQueue.createQueue(params, callback);
  }

  listQueue(): Request<ListQueuesResult, AWSError> {
    return this.currentQueue.listQueues();
  }

  getQueueUrl(params: GetQueueUrlRequest, callback?: (err: AWSError, data: GetQueueUrlResult) => void):
      Request<GetQueueUrlResult, AWSError> {
    return this.currentQueue.getQueueUrl(params, callback);
  }

  deleteQueue(params: DeleteQueueRequest, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return this.currentQueue.deleteQueue(params, callback);
  }

  setQueueAttributes(params: SetQueueAttributesRequest, callback?: (err: AWSError, data: {}) => void):
      Request<{}, AWSError> {
    return this.currentQueue.setQueueAttributes(params, callback);
  }

  getQueueAttributes(params: GetQueueAttributesRequest, callback?: (err: AWSError, data: GetQueueAttributesResult) => void):
      Request<GetQueueAttributesResult, AWSError> {
    return this.currentQueue.getQueueAttributes(params, callback);
  }

  purgeQueue(params: PurgeQueueRequest, callback?: (err: AWSError, data: {}) => void): Request<{}, AWSError> {
    return this.currentQueue.purgeQueue(params, callback);
  }

  sendMessage<T>(): T {
    throw new Error('Method not implemented.');
  }

  sendMessageBatch<T>(): T {
    throw new Error('Method not implemented.');
  }

  receiveMessage<T>(): T {
    throw new Error('Method not implemented.');
  }

  deleteMessage<T>(): T {
    throw new Error('Method not implemented.');
  }

  deleteMessageBatch<T>(): T {
    throw new Error('Method not implemented.');
  }

  changeMessageVisibility<T>(): T {
    throw new Error('Method not implemented.');
  }

  changeMessageVisibilityBatch<T>(): T {
    throw new Error('Method not implemented.');
  }

  addPermission<T>(): T {
    throw new Error('Method not implemented.');
  }

  removePermission<T>(): T {
    throw new Error('Method not implemented.');
  }

  tagQueue<T>(): T {
    throw new Error('Method not implemented.');
  }

  untagQueue<T>(): T {
    throw new Error('Method not implemented.');
  }

  listQueueTag<T>(): T {
    throw new Error('Method not implemented.');
  }

  listDeadLetterSourceQueues<T>(): T {
    throw new Error('Method not implemented.');
  }
}
