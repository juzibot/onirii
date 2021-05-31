# Onirii

Universal queue SDK

## Features

### Support message queue list:

- [ ] ActiveMQ (Waiting)
- [x] AmazonSQS (Developing)
- [ ] CMQ (Waiting)
- [ ] CKafka (Waiting)
- [ ] TDMQ (Waiting)
- [ ] TubeMQ (Terminated) 
- [ ] JCQ (Waiting)
- [ ] Kafka (Waiting)
- [ ] MQTT (Waiting)
- [ ] RocketMQ (Waiting)
- [x] RabbitMQ (Developing)

### Single Function list:

- [ ] Rabbit ConfirmChannel Support
- [ ] Rabbit Manager Api Full Support
- [ ] Set Max Channel Count When Creating Connection

## Onirii Supported Features List

| Queue | Queue | Exchange | Message | Permission | Tag | Other | SDK | Api | Remark |
| :----: | :----: | :----: | :----: | :----: | :----: | :----: | :----: | :----: | :----: |
| ActiveMQ |  |  |  |  |  |  |  |  |  |
| AmazonSQS | ✓ | x | ✓ | ✓ | ✓ | ✓ | ✓ |  |  |
| CMQ |  |  |  |  |  |  |  |  |  |
| CKafka |  |  |  |  |  |  |  |  |  |
| TDMQ |  |  |  |  |  |  |  |  |  |
| JCQ |  |  |  |  |  |  |  |  |  |
| Kafka |  |  |  |  |  |  |  |  |  |
| MQTT |  |  |  |  |  |  |  |  |  |
| RocketMQ |  |  |  |  |  |  |  |  |  |
| RabbitMQ | ✓ | ✓ | ✓ | ✓ |  |  |  |  |  |

## Developing Status

Note:: ✓ realized ✓✓ realized and tested

### OriginalQueueInterface

| Queue | createQueue | getQueue | deleteQueue | purgeQueue |
| :----: | :-----: | :----: | :----: | :----: |
| RabbitMQ | x | x | ✓✓ | ✓✓ | 

### AmqpQueueInterface

| Queue | assertQueue | getQueueStatus | bindQueue | unbindQueue |
| :----: | :-----: | :----: | :----: | :----: |
| RabbitMQ | ✓✓ | ✓✓ | ✓✓ | ✓✓ |

### AmqpExchangeInterface

| Queue | assertExchange | checkExchange | deleteExchange | bindExchange | unbindExchange |  
| :----: | :-----: | :----: | :----: | :----: |  :----: |
| RabbitMQ | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ |

## SDK Description

### AmazonSQS Generic AWS-SDK (Queue Sdk Version: 2012-11-05)

method return type: (params = {}, callback)

#### Queue

| SDK | Onirii | Description |
| ---- | ---- | ---- |
| createQueue() | |Creates a new standard or FIFO queue. |
| setQueueAttributes() | | Sets the value of one or more queue attributes. |
| listQueues() | | Returns a list of your queues in the current region. |
| getQueueUrl() | | Returns the URL of an existing Amazon SQS queue. |
| getQueueAttributes() | | Gets attributes for the specified queue. |
| deleteQueue() | | Deletes the queue specified by the QueueUrl, regardless of the queue's contents. |
| purgeQueue() | | Deletes the messages in a queue specified by the QueueURL parameter. |

#### Message

| SDK | Onirii | Description |
| ---- | ---- | ---- |
| sendMessage() | | Delivers a message to the specified queue. |
| sendMessageBatch() | | Delivers up to ten messages to the specified queue. |
| receiveMessage() | | Retrieves one or more messages (up to 10), from the specified queue. |
| deleteMessage() | | Deletes the specified message from the specified queue. |
| deleteMessageBatch() | | Deletes up to ten messages from the specified queue. |
| changeMessageVisibility() | | Changes the visibility timeout of a specified message in a queue to a new value. |
| changeMessageVisibilityBatch() | |Changes the visibility timeout of multiple messages. |

#### Tag

| SDK | Onirii | Description |
| ---- | ---- | ---- |
| tagQueue() | | Add cost allocation tags to the specified Amazon SQS queue. |
| untagQueue() | | Remove cost allocation tags from the specified Amazon SQS queue. |
| listQueueTags() | | List all cost allocation tags added to the specified Amazon SQS queue. |

#### Permission

| SDK | Onirii | Description |
| ---- | ---- | ---- |
| addPermission() | | Adds a permission to a queue for a specific principal. | 
| removePermission() | | Revokes any permissions in the queue policy that matches the specified Label parameter. |

#### Other

| SDK | Onirii | Description |
| ---- | ---- | ---- |
| listDeadLetterSourceQueues() | | Returns a list of your queues that have the RedrivePolicy queue attribute configured with a dead-letter queue. |
