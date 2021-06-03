import { Logger } from 'log4js';
import { LogFactory } from '../../src/factory/log-factory';
import { AmqpConnectService } from '../../src/service/amqp/amqp-connect-service';

const logger: Logger = LogFactory.create('default');

test('amqp-connect-service-test', async () => {
  const connectService = new AmqpConnectService('test');
  expect(connectService).not.toBe(undefined);
  await connectService.ready();
  // multiple channel test
  logger.debug(connectService.MAX_CHANNEL_COUNT);
  const channelList = [];
  for (let x = 0; x <= connectService.MAX_CHANNEL_COUNT; x++) {
    if (x % 2 == 0) {
      await connectService.createChannelService(true);
      continue;
    }
    if (x < 20) {
      channelList.push(await connectService.createChannelService(true));
    }
    await connectService.createChannelService(false);
  }
  logger.debug(channelList);

  // over max channel warn test
  expect(await connectService.createChannelService(true)).toBe(undefined);

});

jest.setTimeout(600000);
