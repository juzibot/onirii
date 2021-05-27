import { AWSError } from 'aws-sdk/lib/error';
import { sqsParamsType, sqsResponse, sqsResponseType } from '../model/amazon-sqs-model';

export default interface QueueAdapter {
  creatQueue(params: paramType, callback?: callbackType): responseType;

  listQueue(): responseType;

  getQueueUrl(params: paramType, callback?: callbackType): responseType;

  deleteQueue(params: paramType, callback?: callbackType): responseType;

  setQueueAttributes(params: paramType, callback?: callbackType): responseType;

  getQueueAttributes(params: paramType, callback?: callbackType): responseType;

  purgeQueue(params: paramType, callback?: callbackType): responseType;
}


export type paramType = sqsParamsType;

export type callbackType = (err: AWSError, data: sqsResponseType) => void;

export type responseType = sqsResponse;

