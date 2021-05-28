import { AmqpImpl } from '../../src/components/amqp-impl';
import { LogFactory } from '../../src/factory/log-factory';
import { QueueEnum } from '../../src/model/queue-enum';

const logger = LogFactory.getLogger('amqp-impl-test');

test('amqp-impl-connect', async () => {
  const instance = new AmqpImpl('test-amqp-impl', QueueEnum.RABBIT);
  await instance.ready();
});

test('amqp-impl-amqp-queue-interface-test', async () => {
  const instance = new AmqpImpl('test-amqp-impl', QueueEnum.RABBIT);
  await instance.ready();

  const assertQueueRs = await instance.assertQueue('testQueue');
  logger.debug(assertQueueRs);

  const getQueueSimpleStatusRs = await instance.getQueueSimpleStatus('testQueue');
  logger.debug(getQueueSimpleStatusRs);

  const bindQueueRs = await instance.bindQueueExchange('testQueue', 'testExchange', 'testKey');
  logger.debug(bindQueueRs);

  const unbindQueueRs = await instance.bindQueueExchange('testQueue', 'testExchange', 'testKey');
  logger.debug(unbindQueueRs);

  const purgeQueueRs = await instance.purgeQueue('testQueue');
  logger.debug(purgeQueueRs);

  const deleteQueueRs = await instance.deleteQueue('testQueue');
  logger.debug(deleteQueueRs);
});
