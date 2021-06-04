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
  const channelList: string[] = [];
  for (let x = 0; x <= connectService.MAX_CHANNEL_COUNT; x++) {
    if (x < 10) {
      await connectService.createChannelService(true);
      continue;
    }
    if (x < 20) {
      await connectService.createChannelService(false);
      continue;
    }
    if (x < 30) {
      channelList.push((await connectService.createChannelWrapper(true))!.instanceName);
      continue;
    }
    if (x < 35) {
      channelList.push((await connectService.createChannelWrapper(false))!.instanceName);
      continue;
    }
    if (x < 40) {
      channelList.push((await connectService.createChannelService(true))!.instanceName);
      continue;
    }
    if (x < 45) {
      channelList.push((await connectService.createChannelService(false))!.instanceName);
      continue;
    }
    await connectService.createChannelService(false);
  }
  // test kill channel
  logger.debug(channelList);
  for (let channelListElement of channelList) {
    await connectService.killChannel(channelListElement);
  }
  // re flash pool test
  expect(await connectService.createChannelService(true)).not.toBe(undefined);
  for (let i = 0; i < 25 - 1; i++) {
    await connectService.createChannelWrapper(true);
  }
  // over max channel warn test
  expect(await connectService.createChannelService(true)).toBe(undefined);
  expect(await connectService.createChannelWrapper(true)).toBe(undefined);

  await new Promise(r => setTimeout(r, 2000));

  await connectService.close();
});

test('amqp-connect-service-error-test', async () => {
  try {
    new AmqpConnectService('test2', '');
  } catch (err) {
    expect(err).not.toBe(undefined);
  }
  const connect = new AmqpConnectService('test3', 'https://www.heavenark.com');
  try {
    await connect.ready();
  } catch (err) {
    expect(err).not.toBe(undefined);
  }

  await new Promise(r => setTimeout(r, 2000));
});

jest.setTimeout(600000);
