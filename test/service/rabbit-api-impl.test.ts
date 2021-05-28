import { LogFactory } from '../../src/factory/log-factory';
import { RabbitImpl } from '../../src/service/rabbit-impl';

const logger = LogFactory.getLogger('rabbit-api-impl-test');

const impl = new RabbitImpl('test-queue', 'amqp://test:testtset123+@rabbit-mq-test.heavenark.cn:5672', undefined, undefined, {
  clientProperties: {
    connection_name: 'test-name',
  },
});

test('rabbit-api-impl-list', async () => {
  await impl.init();

  const rs = await impl.getVhost();

  logger.info(rs);

  const rs2 = await impl.getVhost('testHost');

  logger.info(rs2);
});

test('rabbit-api-impl-create-vhost', async () => {
  await impl.init();

  const rs = await impl.createVhost('testHost');

  expect(rs).toBe(true);

  const rs2 = await impl.createVhost('testHost');

  expect(rs2).toBe(false);
});
