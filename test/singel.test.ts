import { AmqpConnectService } from '../src/service/amqp/amqp-connect-service';

test('single-test', async () => {
  const connection = new AmqpConnectService('single-test');
  await connection.ready();

  const channelPool = [];

  for (let i = 0; i < 10; i++) {
    channelPool.push(await connection.createChannelService(false));
  }

  channelPool[0]!.createQueueIfNotExist('aqueue');

  // for (let channelPoolElement of channelPool) {
  //   new Promise(()=>{
  //     if (!channelPoolElement) {
  //       return;
  //     }
  //     for (let i = 0; i < 100000; i++) {
  //       channelPoolElement.sendMessageToQueue('aqueue',Buffer.from(`TestData-${Date.now()}`));
  //     }
  //   })
  // }

  let consumerCount = 0;

  for (let channelPoolElement of channelPool) {
    if (consumerCount > 0) {
      break;
    }
    channelPoolElement!.enhancerConsume('aqueue', (msg) => {
      channelPoolElement!.ackMessage(msg);
    });
    consumerCount++;
  }


  await new Promise(r => setTimeout(r, 10 * 1000));

  // await channelService.killConsume(consumerInstance.consumerName);

  await new Promise(r => setTimeout(r, 60 * 60 * 1000));
});

jest.setTimeout(1000 * 60 * 60);
