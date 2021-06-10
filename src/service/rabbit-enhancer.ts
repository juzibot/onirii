import amqp from 'amqplib';
import { Options } from 'amqplib/properties';
import { RMExchange } from '../model/rabbit-manager/rabbit-manager-exchange-namespace';
import { RMQueue } from '../model/rabbit-manager/rabbit-manager-queue-namespace';
import { AmqpEnhancerConsumerWrapper } from '../wrapper/amqp-enhancer-consumer-wrapper';
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
    queue: string,
    processor: (msg: amqp.GetMessage, channel: AmqpChannelService) => Promise<boolean>,
    delay?: number,
    consumerName?: string,
    options?: Options.Get,
  ): Promise<AmqpEnhancerConsumerWrapper> {
    const consumer = this.getNextChannel().enhancerConsume(queue, processor, delay, consumerName, options);
    if (consumer) {
      this.consumerPool.push(consumer);
      return consumer;
    }
    throw new Error(`Can't create consumer, This is a unexpect error please create issue with code demo`);
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

  public async pushOperation(processor: (currentChannel: AmqpChannelService) => Promise<any>): Promise<any> {
    return processor(this.getNextChannel());
  }

  public async close(): Promise<void> {
    await Promise.all(this.connectionPool.map(element => element.close()));
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
