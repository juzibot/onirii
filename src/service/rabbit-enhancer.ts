import { Options } from 'amqplib/properties';
import { RMExchange } from '../model/rabbit-manager/rabbit-manager-exchange-namespace';
import { RMQueue } from '../model/rabbit-manager/rabbit-manager-queue-namespace';
import { AmqpEnhancerConsumerWrapper, EnhancerConsumerProcessor } from '../wrapper/amqp-enhancer-consumer-wrapper';
import { AmqpChannelService } from './amqp/amqp-channel-service';
import { AmqpConfirmChannelService } from './amqp/amqp-confirm-channel-service';
import { AmqpConnectService } from './amqp/amqp-connect-service';

export class RabbitEnhancer {

  private readonly instanceName: string;

  private readonly enhancerProtocol: string;

  private connectionPool: AmqpConnectService[] = [];

  private channelPool: (AmqpChannelService | AmqpConfirmChannelService)[] = [];

  private consumerPool: AmqpEnhancerConsumerWrapper[] = [];

  private readonly configure: RabbitEnhancerConfigure;

  private connectionPoint = 0;

  private channelPoint = 0;

  private dynamicConsumerPool: DynamicConsumer[] = [];

  private agentInstance: any;

  constructor(name: string, protocol: 'amqp091' | 'http', configure: RabbitEnhancerConfigure) {
    if (protocol === 'http') {
      throw new Error('Not Complete Supported Yet You Can Try It With createRabbitManagerService()');
    }
    this.instanceName = name;
    this.enhancerProtocol = protocol;
    this.configure = configure;
  }

  public async ready() {
    // create connection
    for (let i = 0; i < this.configure.openConnectionCount; i++) {
      const connectInstance = new AmqpConnectService(`${ this.instanceName }`, i);
      await connectInstance.ready();
      if (!connectInstance) {
        throw new Error(`Can Not Create Connection ${ this.instanceName }-${ i }`);
      }
      this.connectionPool.push(connectInstance);
    }
    // create channel
    for (let i = 0; i < this.configure.openChannelCount; i++) {
      const confirm: boolean = this.configure.openChannelType === 'confirm';
      const currentConnection = this.getNextConnection();
      const channelInstance = confirm ?
        await currentConnection.createChannelService(true) :
        await currentConnection.createChannelService(false);
      if (!channelInstance) {
        throw new Error(`Can Not Create Channel At ${ currentConnection.instanceName }`);
      }
      this.channelPool.push(channelInstance);
    }
    this.connectionPoint = 0;
    // init resource
    if (this.configure.resourceConfigure) {
      await this.initExchange();
      await this.initQueue();
      await this.initBind();
    }
  }

  public async addConsumer(
    queue: string, processor: EnhancerConsumerProcessor, delay?: number, replica?: 1, options?: Options.Get,
  ): Promise<AmqpEnhancerConsumerWrapper>;
  public async addConsumer(
    queue: string, processor: EnhancerConsumerProcessor, delay?: number, replica?: number, options?: Options.Get,
  ): Promise<AmqpEnhancerConsumerWrapper[]>;
  public async addConsumer(
    queue: string, processor: EnhancerConsumerProcessor, delay?: number, replica = 1, options?: Options.Get,
  ): Promise<AmqpEnhancerConsumerWrapper | AmqpEnhancerConsumerWrapper[]> {
    const consumerPool = [];
    for (let i = 0; i < replica; i++) {
      const consumer = this.getNextChannel().enhancerConsume(queue, processor, delay, undefined, options);
      if (consumer) {
        this.consumerPool.push(consumer);
        consumerPool.push(consumer);
        continue;
      }
      throw new Error(`Can't create consumer, This is a unexpect error please create issue with code demo`);
    }
    if (replica === 1) {
      return consumerPool[0];
    }
    return consumerPool;
  }

  public addDynamicConsumer(
    queue: string,
    processor: EnhancerConsumerProcessor,
    options?: Options.Get,
    maxConsumerCount = 50,
    preAddConsumerCount = 5,
    pressureCount = 25,
    agentCheckIdleTime = 10000,
  ): void {
    this.dynamicConsumerPool.push({
      targetQueue: queue,
      consumerPool: [],
      maxConsumer: maxConsumerCount,
      options: options,
      processor,
      preAddConsumerCount: preAddConsumerCount,
      pressureCount: pressureCount,
      agentCheckIdleTime: agentCheckIdleTime,
    });
    if (!this.agentInstance) {
      this.dynamicAgent();
      this.agentInstance = setInterval(() => this.dynamicAgent(), agentCheckIdleTime);
    }
  }

  public async killConsumer(name: string): Promise<void> {
    const currentConsumer = this.consumerPool.find(element => element.consumerName === name);
    if (currentConsumer) {
      await currentConsumer.kill();
      this.consumerPool = this.consumerPool.filter(element => element.consumerName !== name);
      return;
    }
    throw new Error(`Can't kill unknown consumer ${ name }`);
  }

  public async killDynamicConsumer(targetQueue: string) {
    const currentDynamicConsumer = this.dynamicConsumerPool.find(element => element.targetQueue === targetQueue);
    if (currentDynamicConsumer) {
      this.dynamicConsumerPool = this.dynamicConsumerPool.filter(element => element.targetQueue != targetQueue);
      await Promise.all(
        currentDynamicConsumer.consumerPool.map(consumer => consumer.kill()));
      if (this.dynamicConsumerPool.length === 0) {
        clearInterval(this.agentInstance);
      }
      return;
    }
    throw new Error(`Can't kill unknown target queue(${ targetQueue }) dynamic consumer`);
  }

  public async pushOperation(processor: (currentChannel: AmqpChannelService) => Promise<any>): Promise<any> {
    return processor(this.getNextChannel());
  }

  public async close(): Promise<void> {
    await Promise.all(this.dynamicConsumerPool.map(element => this.killDynamicConsumer(element.targetQueue)));
    await Promise.all(this.connectionPool.map(element => element.close()));
  }

  public getDynamicConsumerData(targetQueue: string) {
    return this.dynamicConsumerPool.find(element => element.targetQueue = targetQueue);
  }

  private async initExchange(): Promise<void> {
    const exchangeInitData = this.configure.resourceConfigure!.exchangeList;
    if (!exchangeInitData) {
      return;
    }
    for (let exchangeInitDatum of exchangeInitData) {
      if (this.enhancerProtocol === 'amqp091') {
        await this.getNextChannel()
          .createExchangeIfNotExist(exchangeInitDatum.name, exchangeInitDatum.type, exchangeInitDatum.options);
      }
    }
    this.channelPoint = 0;
  }

  private async initQueue(): Promise<void> {
    const queueInitData = this.configure.resourceConfigure!.queueList;
    if (!queueInitData) {
      return;
    }
    for (let queueInitDatum of queueInitData) {
      if (this.enhancerProtocol === 'amqp091') {
        await this.getNextChannel().createQueueIfNotExist(queueInitDatum.name, queueInitDatum.options);
      }
    }
    this.channelPoint = 0;
  }

  private async initBind(): Promise<void> {
    const bindListData = this.configure.resourceConfigure!.bindList;
    if (!bindListData) {
      return;
    }
    for (let bindListDatum of bindListData) {
      if (bindListDatum.type === 'qte') {
        await this.bindQueueToExchange(bindListDatum);
      } else if (bindListDatum.type === 'ete') {
        await this.bindExchangeToExchange(bindListDatum);
      }
    }
    this.channelPoint = 0;
  }

  private async bindQueueToExchange(configure: RabbitEnhancerBind) {
    if (this.enhancerProtocol === 'amqp091') {
      await this.getNextChannel().bindQueueToExchange(configure.targetSourceName, configure.fromSourceName, configure.key, configure.options);
    }
  }

  private async bindExchangeToExchange(configure: RabbitEnhancerBind) {
    if (this.enhancerProtocol === 'amqp091') {
      await this.getNextChannel().bindExchangeToExchange(configure.targetSourceName, configure.fromSourceName, configure.key, configure.options);
    }
  }

  private getNextConnection(): AmqpConnectService {
    if (this.connectionPoint === this.connectionPool.length) {
      this.connectionPoint = 0;
    }
    const currentConnection = this.connectionPool[this.connectionPoint];
    this.connectionPoint++;
    return currentConnection;
  }

  private getNextChannel(): AmqpChannelService {
    if (this.channelPoint === this.channelPool.length) {
      this.channelPoint = 0;
    }
    const currentChannel = this.channelPool[this.channelPoint];
    this.channelPoint++;
    return currentChannel;
  }

  private dynamicAgent() {
    this.dynamicConsumerPool.forEach(async element => {
      const currentChannel = this.getNextChannel();
      const waitingMessageCount = (await currentChannel.getQueueStatus(element.targetQueue)).messageCount;
      let pressure = Math.ceil(waitingMessageCount / element.pressureCount);
      const existConsumerCount = element.consumerPool.length;
      currentChannel.logger.debug(
        `DynamicAgent Processing Queue: ${ element.targetQueue }`,
        `messageCount:${ waitingMessageCount } consumerCount:${ existConsumerCount }`,
      );
      // check exist consumer over head
      if (pressure > 1) {
        await this.dynamicOverHead(existConsumerCount, element, currentChannel, pressure, waitingMessageCount);
      } else if (pressure === 0 && element.consumerPool.length > 1) {
        await RabbitEnhancer.dynamicKill(element);
      }
    });
  }

  private async dynamicOverHead(
    existConsumerCount: number,
    element: DynamicConsumer,
    currentChannel: AmqpChannelService,
    needCreateCount: number,
    waitingMessageCount: number,
  ) {
    //check already full consumer count
    if (existConsumerCount >= element.maxConsumer) {
      currentChannel.logger.warn(
        `Dynamic Agent Got Already MaxConsumer${ element.maxConsumer } Count Created`,
        `But Message Stall Over PressureCount(${ element.pressureCount }) Current(${ waitingMessageCount })`,
      );
      return;
    }
    needCreateCount = Math.min(needCreateCount, element.preAddConsumerCount);
    // check over head and confirm new consumer count
    if (element.maxConsumer < existConsumerCount + needCreateCount) {
      needCreateCount = element.maxConsumer - existConsumerCount;
    }
    // create new consumer
    const newConsumer = await this.addConsumer(element.targetQueue, element.processor, 100, needCreateCount, element.options);
    element.consumerPool = element.consumerPool.concat(newConsumer);
  }

  private static async dynamicKill(element: DynamicConsumer) {
    const lastConsumer = element.consumerPool.shift();
    if (lastConsumer) {
      await lastConsumer.kill();
    }
  }

}

export interface RabbitEnhancerConfigure {
  openConnectionCount: number;
  openChannelCount: number;
  openChannelType: 'normal' | 'confirm',
  resourceConfigure?: {
    exchangeList?: RabbitEnhancerExchange[],
    queueList?: RabbitEnhancerQueue [],
    bindList?: RabbitEnhancerBind[]
  }
}

export interface RabbitEnhancerExchange {
  name: string,
  type: 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string,
  options?: Options.AssertExchange | RMExchange.CreateOptions,
}

export interface RabbitEnhancerQueue {
  name: string,
  options?: Options.AssertQueue | RMQueue.CreateOptions,
}

export interface RabbitEnhancerBind {
  type: 'qte' | 'ete',
  fromSourceName: string,
  targetSourceName: string,
  key: string,
  options?: any
}

export interface DynamicConsumer {
  targetQueue: string,
  consumerPool: AmqpEnhancerConsumerWrapper[],
  processor: EnhancerConsumerProcessor,
  options?: Options.Get,
  pressureCount: number,
  preAddConsumerCount: number;
  maxConsumer: number,
  agentCheckIdleTime: number
}
