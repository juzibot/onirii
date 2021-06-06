import { Logger } from 'log4js';
import { LogFactory } from '../src/factory/log-factory';
import { AmqpConnectService } from '../src/service/amqp/amqp-connect-service';

const logger: Logger = LogFactory.create('default');

test('single-test', async () => {
  const connection = new AmqpConnectService('single-test');
  await connection.ready();

  const channelService = await connection.createChannelService(false);
  if (!channelService) {
    return;
  }

  await channelService.setPrefetchCount(1);

  const consumerInstance = channelService.consume('testQueue2', async (msg) => {
    logger.debug(msg!.content.toString());
    await channelService.ackMessage(msg!);
  });

  await new Promise(r => setTimeout(r, 10 * 1000));

  await channelService.killConsume(consumerInstance.consumerName);

  await new Promise(r => setTimeout(r, 60 * 60 * 1000));
});

jest.setTimeout(1000 * 60 * 60);
