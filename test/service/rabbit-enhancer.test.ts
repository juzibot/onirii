import { RabbitEnhancer } from '../../src/service/rabbit-enhancer';

test('rabbit-enhancer-test', async () => {

  const rabbitEnhancer = new RabbitEnhancer('test-enhancer', 'amqp091', {
    openConnectionCount: 2,
    openChannelType: 'normal',
    openChannelCount: 8,
    resourceConfigure: {
      queueList: [
        {
          name: 'EnhancerTestQueue',
        }, {
          name: 'testQueue2',
        },
      ],
      exchangeList: [
        {
          name: 'EnhancerTestExchange',
          type: 'direct',
        },
      ],
      bindList: [
        {
          type: 'qte',
          fromSourceName: 'EnhancerTestExchange',
          targetSourceName: 'EnhancerTestQueue',
          key: 'testKey',
        },
      ],
    },
  });

  await rabbitEnhancer.ready();

  const consumerList = await rabbitEnhancer.addConsumer('aqueue', async (msg, channel) => {
    if (msg) {
      msg.content.toString();
      await new Promise(r => setTimeout(r, 15 * 1000));
      await channel.sendMessageToQueue('testQueue2', Buffer.from(msg.content.toString()));
    }
    return true;
  }, 100, 10);

  const singleConsumer = await rabbitEnhancer.addConsumer('aqueue', async (msg, channel) => {
    if (msg) {
      msg.content.toString();
      await new Promise(r => setTimeout(r, 15 * 1000));
      await channel.sendMessageToQueue('testQueue2', Buffer.from(msg.content.toString()));
    }
    return true;
  }, 100, 1);

  expect(consumerList.length).toBe(10);
  expect(singleConsumer).not.toBe(undefined);

  await new Promise(r => setTimeout(r, 5 * 1000));

  await rabbitEnhancer.killConsumer(singleConsumer.consumerName);

  for (let i = 0; i < 1200; i++) {
    new Promise(() => {
      rabbitEnhancer.pushOperation(async channel => {
        return await channel.sendMessageToQueue('aqueue', Buffer.from('testMessage'));
      });
    });
  }

  await new Promise(r => setTimeout(r, 30 * 1000));

  await rabbitEnhancer.close();

});

jest.setTimeout(60 * 60 * 1000);
