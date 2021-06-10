import { LogFactory } from '../../../src/factory/log-factory';
import { AmqpConnectService } from '../../../src/service/amqp/amqp-connect-service';
import { RabbitManagerService } from '../../../src/service/rabbit/rabbit-manager-service';

const managerService = new RabbitManagerService('testManager', 'https://rabbit-mq-test.hva.asia/api', 'test:testtset123+');

let connectService;

const logger = LogFactory.create('test');

test('rabbit-manager-service-test-health', async () => {
  await managerService.ready();

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
  let tempRs;

  if (await managerService.getVhost(testHost)) {
    expect(await managerService.deleteVhost(testHost)).toBe(true);
  }
  expect(await managerService.getVhost('notExist')).toBe(false);
  expect(await managerService.createVhost(testHost)).toBe(true);
  expect(await managerService.createVhost(testHost)).toBe(false);
  tempRs = await managerService.getVhostConnection(testHost);
  if (typeof tempRs !== 'boolean') {
    expect(tempRs.length).toBe(0);
  }
  connectService = new AmqpConnectService('test', 0, `amqp://test:testtset123+@rabbit-mq-test.hva.asia:5672/${testHost}`);
  await connectService.ready();
  await new Promise(r => setTimeout(r, 5 * 1000));
  tempRs = await managerService.getVhostConnection(testHost);
  if (typeof tempRs !== 'boolean') {
    expect(tempRs.length).toBe(1);
  }
  tempRs = await managerService.getVhostOpenChannels(testHost);
  if (typeof tempRs !== 'boolean') {
    expect(tempRs.length).toBe(0);
  }
  await connectService.createChannelService(true);
  await new Promise(r => setTimeout(r, 5 * 1000));
  tempRs = await managerService.getVhostOpenChannels(testHost);
  if (typeof tempRs !== 'boolean') {
    expect(tempRs.length).toBe(1);
  }
  await connectService.close();
  await new Promise(r => setTimeout(r, 5 * 1000));
  tempRs = await managerService.getVhostConnection(testHost);
  if (typeof tempRs !== 'boolean') {
    expect(tempRs.length).toBe(0);
  }
  tempRs = await managerService.getVhostOpenChannels(testHost);
  if (typeof tempRs !== 'boolean') {
    expect(tempRs.length).toBe(0);
  }
  expect(await managerService.deleteVhost(testHost)).toBe(true);
  expect(await managerService.deleteVhost(testHost, true)).toBe(true);

  // cant test now
  // await managerService.startNode(testHost,'testNode');
});

jest.setTimeout(30 * 1000);

test('rabbit-manager-service-test-exchange', async () => {
  const testExchange = 'exchange-test';

  expect((await managerService.getExchange()).length).not.toBe(0);
  expect((await managerService.getExchange('%2F')).length).not.toBe(0);
  expect(await managerService.getExchange('%2F', testExchange)).toBe(false);
  expect(await managerService.createExchange('%2F', testExchange, {
    type: 'direct',
    auto_delete: false,
  })).toBe(true);
  expect(await managerService.getExchange('%2F', testExchange)).not.toBe(false);
  expect(await managerService.deleteExchange('%2F', testExchange, true)).toBe(true);
  expect(await managerService.getExchange('%2F', testExchange)).toBe(false);
});
