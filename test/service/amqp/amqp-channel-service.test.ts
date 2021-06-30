import amqp from 'amqplib';
import { AmqpChannelService } from '../../../src/service/amqp/amqp-channel-service';
import { AmqpConnectService } from '../../../src/service/amqp/amqp-connect-service';

test('amqp-channel-service-test', async () => {
  const connect = new AmqpConnectService('test-connect');
  await connect.ready();
  const defaultChannel = await connect.createChannelService(false);
  if (!defaultChannel) {
    throw new Error('Undefined Channel');
  }

  try {
    new AmqpChannelService('testChannel', <amqp.Channel><unknown>undefined);
  } catch (err) {
    expect(err).not.toBe(undefined);
  }

  await defaultChannel.initMetaConfigure({
    queueList: [
      {
        name: 'testQueue',
      },
      {
        name: 'testQueue2',
      },
    ],
    exchangeList: [
      {
        name: 'testExchange',
        type: 'direct',
      },
      {
        name: 'testExchange2',
        type: 'direct',
      },
    ],
    bindList: [
      {
        type: 'qte',
        fromSourceName: 'testQueue',
        targetSourceName: 'testExchange',
        key: 'testKey',
      },
      {
        type: 'ete',
        fromSourceName: 'testExchange',
        targetSourceName: 'testExchange2',
        key: 'testKey',
      },
    ],
  });

  // queue part

  await defaultChannel.getQueueStatus('testQueue');
  await defaultChannel.purgeQueue('testQueue');
  await defaultChannel.sendMessageToQueue('testQueue', Buffer.from('testMessage'));
  expect((await defaultChannel.getQueueStatus('testQueue')).messageCount).toBe(1);
  await defaultChannel.purgeQueue('testQueue');
  expect((await defaultChannel.getQueueStatus('testQueue')).messageCount).toBe(0);

  // channel part
  await defaultChannel.getExchangeStatus('testExchange');
  await defaultChannel.sendMessageToExchange('testExchange2', 'testKey', Buffer.from('testMessage'));
  expect((await defaultChannel.getQueueStatus('testQueue')).messageCount).toBe(1);

  // message part
  for (let i = 0; i < 10; i++) {
    await defaultChannel.sendMessageToQueue('testQueue', Buffer.from('testMessage'));
  }
  await new Promise(r => setTimeout(r, 5 * 1000));

  let position = 0;
  const consumer = defaultChannel.consume('testQueue', msg => {
    if (msg) {
      if (position < 1) {
        defaultChannel.ackMessage(msg);
      } else if (position < 2) {
        defaultChannel.rejectMessage(msg);
      }
      position++;
    }
  });

  await new Promise(r => setTimeout(r, 5 * 1000));
  expect(position).toBe(11 + 1);

  // kill consumer
  await defaultChannel.killConsume(consumer.consumerName);
  await defaultChannel.killConsume('unknown');

  // other
  await defaultChannel.ackAllMessage();
  await defaultChannel.nackAllMessage();
  await defaultChannel.recover();
  await defaultChannel.setPrefetchCount(1);
  // clean
  await defaultChannel.unbindQueueToExchange('testQueue', 'testExchange', 'testKey');
  await defaultChannel.unbindExchangeToExchange('testExchange', 'testExchange2', 'testKey');
  await defaultChannel.deleteQueue('testQueue');
  await defaultChannel.deleteExchange('testExchange');

  defaultChannel.consume('testQueue2', msg => {
    if (msg) {
    }
  });

  await connect.close();

});

jest.setTimeout(2 * 60 * 1000);
