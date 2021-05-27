import { LogFactory } from '../../src/factory/log-factory';
import { SqsQueueImpl } from '../../src/service/sqs-queue-impl';

test('sqs-queue-impl-init-test', () => {
  const logger = LogFactory.getLogger('test');
  const initType1 = new SqsQueueImpl();
  const initType2 = new SqsQueueImpl(true);
  const initType3 = new SqsQueueImpl(true, {
    customUserAgent: 'test-agent',
  });
  const initType4 = new SqsQueueImpl(true, {
    apiVersion: '2020-05-26',
  });

  initType1.addPermission();

  logger.debug(initType1);
  logger.debug(initType2);
  logger.debug(initType3);
  logger.debug(initType4);

  expect(initType1).not.toBe(initType2);
});