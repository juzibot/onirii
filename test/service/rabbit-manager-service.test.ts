import { LogFactory } from '../../src/factory/log-factory';
import { RabbitManagerService } from '../../src/service/rabbit-manager-service';

const logger = LogFactory.getLogger('rabbit-manager-service-test');

test('rabbit-manager-service-health-interface-test', async () => {
  const instance = new RabbitManagerService('test-rabbit-manager');
  await instance.ready();

  logger.debug(await instance.checkAlarms());
  logger.debug(await instance.checkLocalAlarms());
  logger.debug(await instance.checkCertificate(10, 'months'));
  logger.debug(await instance.checkPortHealth(5672));
  logger.debug(await instance.checkProtocol('amqp091'));
  logger.debug(await instance.checkVirtualHosts());
  logger.debug(await instance.checkNodeMirrorSyncCritical());
  logger.debug(await instance.checkNodeQuorumCritical());
});
