import { LogFactory } from '../../src/factory/log-factory';
import { RabbitManagerService } from '../../src/service/rabbit-manager-service';

const logger = LogFactory.getLogger('rabbit-manager-service-test');

test('rabbit-manager-service-health-interface-test', async () => {
  const instance = new RabbitManagerService('test-rabbit-manager');
  await instance.ready();

  await logger.debug(await instance.checkAlarms());
  await logger.debug(await instance.checkLocalAlarms());
  await logger.debug(await instance.checkCertificate(10, 'months'));
  await logger.debug(await instance.checkPortHealth(5672));
  await logger.debug(await instance.checkProtocol('amqp091'));
  await logger.debug(await instance.checkVirtualHosts());
  await logger.debug(await instance.checkNodeMirrorSyncCritical());
  await logger.debug(await instance.checkNodeQuorumCritical());
});

test('rabbit-manager-service-vhost-interface', async () => {
  const instance = new RabbitManagerService('test-rabbit-manager');
  await instance.ready();
  const otherChannel = instance.createChannel();
  const otherChannel1 = instance.createChannel();

  expect(otherChannel).not.toBe(otherChannel1);

  await new Promise(r => {
    setTimeout(r, 4000);
  });

  // await logger.debug(await instance.getVhost());
  // await logger.debug(await instance.getVhostConnection('%2F'));
  // await logger.debug(await instance.getVhostOpenChannels('%2F'));
  // await logger.debug(await instance.getVhostOpenChannels('%2F', {
  //   name: '(3)',
  //   use_regex: true,
  // }));
  // await logger.debug(await instance.deleteVhost('testHost'));
  await logger.debug(await instance.createVhost('testHost'));

  // logger.debug(await instance.startNode('node','node'))
});
