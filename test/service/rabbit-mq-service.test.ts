import { RabbitMqService } from '../../src/service/rabbit-mq-service';
import { LogFactory } from '../../src/factory/log-factory';

const logger = LogFactory.getLogger('rabbit-mq-service-test');

test('rabbit-mq-original-queue-interface-test', async () => {
  const instance = new RabbitMqService('test-rabbit');
  await instance.ready();

  try {
    instance.createQueue();
  } catch (err) {
    logger.debug('createQueue() test passed');
  }

  try {
    instance.getQueue();
  } catch (err) {
    logger.debug('getQueue() test passed');
  }

  const purgeQueueRs = await instance.purgeQueue('testQueue');
  logger.debug(purgeQueueRs);

  const deleteQueueRs = await instance.deleteQueue('testQueue');
  logger.debug(deleteQueueRs);
});
