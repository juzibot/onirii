import { RabbitEnhancer } from '../../src/service/rabbit-enhancer';

test('rabbit-enhancer-test', async () => {

  const rabbitEnhancer = new RabbitEnhancer('test-enhancer', 'amqp091', {
    openConnectionCount: 10,
    openChannelType: 'normal',
    openChannelCount: 50,
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

  for (let i = 0; i < 1000; i++) {
    await rabbitEnhancer.addConsumer('EnhancerTestQueue', async msg => {
      if (msg) {
        msg.content.toString();
        await rabbitEnhancer.pushOperation(async channel => {
          await channel.sendMessageToQueue('testQueue2', Buffer.from(msg.content.toString()));
        });
      }
      return true;
    }, 500);
  }

  await new Promise(r => setTimeout(r, 10 * 1000));

  await rabbitEnhancer.killConsumer('test-enhancer-amqp-connect-3-channel-4-consumer-3');

  for (let i = 0; i < 120000; i++) {
    new Promise(() => {
      rabbitEnhancer.pushOperation(async channel => {
        return await channel.sendMessageToQueue('aqueue', Buffer.from('testMessage'));
      });
    });
  }

  await new Promise(r => setTimeout(r, 60 * 1000));

  await rabbitEnhancer.close();

});

jest.setTimeout(60 * 60 * 1000);
