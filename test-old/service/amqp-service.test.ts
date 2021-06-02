import { AmqpService } from '../../src/service/amqp-service';
import { LogFactory } from '../../src/factory/log-factory';
import { QueueEnum } from '../../src/model/queue-enum';

const logger = LogFactory.getLogger('amqp-impl-test');

test('amqp-impl-connect', async () => {
  const instance = new AmqpService('test-amqp-impl', QueueEnum.RABBIT);
  await instance.ready();
});

test('amqp-impl-amqp-queue-interface-test', async () => {
  const instance = new AmqpService('test-amqp-impl', QueueEnum.RABBIT);
  await instance.ready();

  const assertQueueRs = await instance.assertQueue('testQueue');
  logger.debug(assertQueueRs);

  const getQueueStatusRs = await instance.getQueueStatus('testQueue');
  logger.debug(getQueueStatusRs);

  const bindQueueRs = await instance.bindQueueToExchange('testQueue', 'testExchange', 'testKey');
  logger.debug(bindQueueRs);

  const unbindQueueRs = await instance.unbindQueueToExchange('testQueue', 'testExchange', 'testKey');
  logger.debug(unbindQueueRs);
});

test('amqp-impl-amqp-exchange-interface-test', async () => {
  const testExchange = 'testExchange';
  const targetExchange = 'targetExchange2';

  const instance = new AmqpService('test-amqp-impl', QueueEnum.RABBIT);
  await instance.ready();

  const assertExchangeRs = await instance.assertExchange(testExchange, 'direct');
  logger.debug(assertExchangeRs);

  const checkExchangeRs = await instance.checkExchange(testExchange);
  logger.debug(checkExchangeRs);

  const bindExchangeToExchangeRs = await instance.bindExchangeToExchange(testExchange, targetExchange, 'testKey');
  logger.debug(bindExchangeToExchangeRs);

  const unbindExchangeToExchangeRs = await instance.unbindExchangeToExchange(testExchange, targetExchange, 'testKey');
  logger.debug(unbindExchangeToExchangeRs);

  const deleteExchangeRs = await instance.deleteExchange(testExchange);
  logger.debug(deleteExchangeRs);
});
