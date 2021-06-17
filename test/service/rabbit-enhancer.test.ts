import { RabbitEnhancer } from '../../src/service/rabbit-enhancer';

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

const testQueue = 'rabbit-enhancer-test-queue';

const testQueue2 = 'rabbit-enhancer-test-queue2';

test('rabbit-enhancer-test', async () => {

  await rabbitEnhancer.ready();
  await rabbitEnhancer.pushOperation(async channel => channel.createQueueIfNotExist(testQueue));
  await rabbitEnhancer.pushOperation(async channel => channel.createQueueIfNotExist(testQueue2));

  const consumerList = await rabbitEnhancer.addConsumer(testQueue, async (msg, channel) => {
    if (msg) {
      msg.content.toString();
      await new Promise(r => setTimeout(r, 15 * 1000));
      await channel.sendMessageToQueue(testQueue2, Buffer.from(msg.content.toString()));
    }
    return true;
  }, 100, 10);

  const singleConsumer = await rabbitEnhancer.addConsumer(testQueue, async (msg, channel) => {
    if (msg) {
      msg.content.toString();
      await new Promise(r => setTimeout(r, 15 * 1000));
      await channel.sendMessageToQueue(testQueue2, Buffer.from(msg.content.toString()));
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
        return await channel.sendMessageToQueue(testQueue, Buffer.from('testMessage'));
      });
    });
  }

  await new Promise(r => setTimeout(r, 30 * 1000));

});

test('rabbit-enhancer-dynamic-test', async () => {

  await rabbitEnhancer.ready();
  await rabbitEnhancer.pushOperation(async channel => channel.createQueueIfNotExist(testQueue));

  rabbitEnhancer.addDynamicConsumer(testQueue, async msg => {
    if (msg) {
      return true;
    }
    return true;
  }, undefined, 10, 2, 100, 5 * 1000);

  for (let i = 0; i < 1000; i++) {
    rabbitEnhancer.pushOperation(async channel => {
      await channel.sendMessageToQueue(testQueue, Buffer.from('testData'));
    }).catch(err => err);
  }

  await new Promise(r => setTimeout(r, 5 * 1000));

  expect(rabbitEnhancer.getDynamicConsumerData(testQueue)?.consumerPool.length).not.toBe(1);

  // wait kill all useless consumer(add extra 20s time)
  await new Promise(r => setTimeout(r, (5 + 2) * 10 * 1000));

  expect(rabbitEnhancer.getDynamicConsumerData(testQueue)?.consumerPool.length).toBe(1);

  await rabbitEnhancer.killDynamicConsumer(testQueue);

  expect(rabbitEnhancer.getDynamicConsumerData(testQueue)).toBe(undefined);

  await rabbitEnhancer.close();

});


jest.setTimeout(60 * 60 * 1000);
