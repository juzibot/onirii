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

export type sqsResponse = Request<sqsResponseType, AWSError>;

export type sqsResponseType =
    ListQueuesResult
    | CreateQueueResult
    | GetQueueUrlResult
    | GetQueueAttributesResult
    | PurgeQueueRequest
    | {};


export type sqsParamsType =
    CreateQueueRequest
    | GetQueueUrlRequest
    | DeleteQueueRequest
    | SetQueueAttributesRequest
    | GetQueueAttributesRequest;