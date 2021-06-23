/**
 * Rabbit Manager Exchange Namespace
 *
 * @since 1.0.0
 * @date 2021-06-07
 * @author  Luminous(BGLuminous)
 */
export namespace RMExchange {

  /**
   * Create exchange options
   */
  export interface CreateOptions {
    type: 'direct' | 'topic' | 'headers' | 'fanout' | 'match' | string,
    auto_delete: boolean,
    durable?: boolean,
    internal?: boolean,
    arguments?: any;
  }

  /**
   * Delete exhcnage options
   */
  export interface DeleteOptions {
    'if-unused': boolean,
  }

  /**
   * Exchange status response model
   */
  export interface ExchangeStatusModel {
    arguments: any,
    auto_delete: boolean,
    durable: boolean,
    internal: boolean,
    message_stats?: {
      publish_in: number,
      publish_in_details: {
        rate: number
      },
      publish_out: number,
      publish_out_details: {
        rate: number
      }
    },
    name: string,
    type: string,
    user_who_performed_action: string,
    vhost: string
  }

}
