import { AmqpConnectService } from '../../src/service/amqp/amqp-connect-service';

test('amqp-channel-service-test', async () => {
  const connect = new AmqpConnectService('test-connect');
  await connect.ready();
  const defaultChannel = await connect.createChannelService(false);
  if (!defaultChannel) {
    throw new Error('Undefined Channel');
  }

  // create test endearment
  await defaultChannel.createQueueIfNotExist('testQueue');
  await defaultChannel.createExchangeIfNotExist('testExchange', 'direct');

  // queue part

  await defaultChannel.getQueueStatus('testQueue');
  await defaultChannel.bindQueueToExchange('testQueue', 'testExchange', 'testKey');
  await defaultChannel.sendMessageToQueue('testQueue', Buffer.from('testMessage'));
  expect((await defaultChannel.getQueueStatus('testQueue')).messageCount).toBe(1);
  await defaultChannel.purgeQueue('testQueue');
  expect((await defaultChannel.getQueueStatus('testQueue')).messageCount).toBe(0);

  // channel part
  await defaultChannel.getExchangeStatus('testExchange');
  await defaultChannel.bindExchangeToExchange('testExchange', 'testExchange2', 'testKey');
  await defaultChannel.sendMessageToExchange('testExchange2', 'testKey', Buffer.from('testMessage'));
  expect((await defaultChannel.getQueueStatus('testQueue')).messageCount).toBe(1);

  // message part
  for (let i = 0; i < 100; i++) {
    await defaultChannel.sendMessageToQueue('testQueue', Buffer.from('testMessage'));
  }

  let position = 0;

  await defaultChannel.consume('testQueue', (msg) => {
    if (msg) {
      if (position < 10) {
        defaultChannel.ackMessage(msg);
      } else if (position > 10 && position < 20) {
        defaultChannel.rejectMessage(msg);
      }
      position++;
    }
  });

  await new Promise(r => setTimeout(r, 1000));

  // await defaultChannel.killConsume(consumer.consumerName);
  expect(position).toBe(110);

  await new Promise(r => setTimeout(r, 1000));

  // other
  await defaultChannel.ackAllMessage();
  await defaultChannel.nackAllMessage();
  await defaultChannel.recover();
  await defaultChannel.setPrefetchCount(1);
  // clean
  await defaultChannel.unbindQueueToExchange('testQueue', 'testExchange', 'testKey');
  await defaultChannel.unbindQueueToExchange('testExchange', 'testExchange2', 'testKey');
  await defaultChannel.deleteQueue('testQueue');
  await defaultChannel.deleteExchange('testExchange');

  await connect.close();

});

jest.setTimeout(15 * 1000);
