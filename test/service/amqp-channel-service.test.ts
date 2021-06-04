import { Logger } from 'log4js';
import { LogFactory } from '../../src/factory/log-factory';
import { AmqpConnectService } from '../../src/service/amqp/amqp-connect-service';

const logger: Logger = LogFactory.create('default');

test('amqp-channel-service-test', async () => {
  const connect = new AmqpConnectService('test-connect');
  await connect.ready();

  const channelList = [];

  for (let i = 0; i < 600; i++) {
    channelList.push(await connect.createChannelService(false));
  }

  for (let channelListElement of channelList) {
    await channelListElement!.enhancerConsume('testQueue', (msg) => {
      logger.debug(msg.content.toString());
      channelListElement!.ackMessage(msg!);
    }, 0);
  }

  await new Promise(r => setTimeout(r, 60 * 60 * 1000));
});

jest.setTimeout(60 * 60 * 1000);

test('amqp-channel-service-test-2', async () => {

});
