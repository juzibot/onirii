import { Logger } from 'log4js';
import { LogFactory } from '../../src/factory/log-factory';
import { AmqpConnectService } from '../../src/service/amqp-connect-service';

const logger: Logger = LogFactory.create('default');

test('amqp-connect-service-test', async () => {
  const connectService = new AmqpConnectService('test');
  await connectService.ready();
  logger.debug(connectService.currentConnection!.connection);
  // multiple channel test
  for (let x = 0; x < connectService.MAX_CHANNEL_COUNT - 2; x++) {
    await connectService.createChannel();
  }
  // each channel/channelService creat test
  await connectService.createConfirmChannel();
  await connectService.createChannelService();
  await connectService.createConfirmChannelService();
  logger.debug(connectService.channelPool.length);
  // over max channel warn test
  expect(await connectService.createChannel()).toBe(undefined);
  //multiple connect test
  const connectService2 = new AmqpConnectService('test2');
  expect(connectService2).not.toBe(undefined);
});

jest.setTimeout(600000);
