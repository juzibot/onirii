import { LogFactory } from '../../../src/factory/log-factory';
import { AmqpConnectService } from '../../../src/service/amqp/amqp-connect-service';
import { RabbitManagerService } from '../../../src/service/rabbit/rabbit-manager-service';

const managerService = new RabbitManagerService('testManager', 'https://rabbit-mq-test.heavenark.cn/api', 'test:testtset123+');

let connectService;

const logger = LogFactory.create('test');

test('rabbit-manager-service-test-health', async () => {
  await managerService.ready(true);

  logger.debug(await managerService.checkAlarms());
  logger.debug(await managerService.checkLocalAlarms());
  logger.debug(await managerService.checkCertificate(20, 'months'));
  logger.debug(await managerService.checkProtocol('amqp091'));
  logger.debug(await managerService.checkPortHealth(5672));
  logger.debug(await managerService.checkVirtualHosts());
  logger.debug(await managerService.checkNodeMirrorSyncCritical());
  logger.debug(await managerService.checkNodeQuorumCritical());
});

test('rabbit-manager-service-test-vhost', async () => {
  const testHost = 'testHost';

  if (await managerService.getVhost(testHost)) {
    expect(await managerService.deleteVhost(testHost)).toBe(true);
  }
  expect(await managerService.getVhost('notExist')).toBe(false);
  expect(await managerService.createVhost(testHost)).toBe(true);
  expect(await managerService.createVhost(testHost)).toBe(false);
  expect((await managerService.getVhostConnection(testHost)).length).toBe(0);
  connectService = new AmqpConnectService('test', `amqp://test:testtset123+@rabbit-mq-test.heavenark.cn:5672/${testHost}`);
  await connectService.ready();
  await new Promise(r => setTimeout(r, 5 * 1000));
  expect((await managerService.getVhostConnection(testHost)).length).toBe(1);
  expect((await managerService.getVhostOpenChannels(testHost)).length).toBe(0);
  await connectService.createChannelService(true);
  await new Promise(r => setTimeout(r, 5 * 1000));
  expect((await managerService.getVhostOpenChannels(testHost)).length).toBe(1);
  await connectService.close();
  await new Promise(r => setTimeout(r, 5 * 1000));
  expect((await managerService.getVhostConnection(testHost)).length).toBe(0);
  expect((await managerService.getVhostOpenChannels(testHost)).length).toBe(0);
  expect(await managerService.deleteVhost(testHost)).toBe(true);
  expect(await managerService.deleteVhost(testHost, true)).toBe(true);

  // cant test now
  // await managerService.startNode(testHost,'testNode');
});

jest.setTimeout(30 * 1000);

test('rabbit-manager-service-test-exchange', async () => {
  const testExchange = 'testExchange';

  expect((await managerService.getExchange()).length).not.toBe(0);
  expect((await managerService.getExchange('%2F')).length).not.toBe(0);
  expect(await managerService.getExchange('%2F', testExchange)).toBe(false);
  expect(await managerService.createExchange('%2F', testExchange, {
    type: 'direct',
    auto_delete: false,
  })).toBe(true);
  expect(await managerService.getExchange('%2F', testExchange)).not.toBe(false);
  expect(await managerService.deleteExchange('%2F', testExchange)).toBe(true);
  expect(await managerService.getExchange('%2F', testExchange)).toBe(false);
});
