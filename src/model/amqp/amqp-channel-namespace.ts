import { Options } from 'amqplib/properties';

/**
 * Amqp Channel namespace
 *
 * @since 1.3.0
 * @date 2021-06-30
 * @author Luminous(BGLuminous)
 */
export namespace AmqpChannelNamespace {

  export interface MetaConfigure {
    exchangeList?: AmqpExchange[],
    queueList?: AmqpQueue [],
    bindList?: AmqpBind[]
  }

  export interface AmqpExchange {
    name: string,
    type: 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string,
    options?: Options.AssertExchange,
    cleanOption?: Options.DeleteExchange,
  }

  export interface AmqpQueue {
    name: string,
    options?: Options.AssertQueue,
    cleanOption?: Options.DeleteQueue,
  }

  export interface AmqpBind {
    type: 'qte' | 'ete',
    fromSourceName: string,
    targetSourceName: string,
    key: string,
    options?: any
  }

}
