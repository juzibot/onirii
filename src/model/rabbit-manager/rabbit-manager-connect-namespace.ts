/**
 * Rabbit Manager Connect Namespace
 *
 * @since 1.0.0
 * @date 2021-06-07
 * @author Luminous(BGLuminous)
 */
export namespace RMConnect {

  /**
   * Vhost connection response model
   */
  export interface VhostConnectionsStatus {
    auth_mechanism: string,
    channel_max: number,
    channels: number,
    client_properties: {
      capabilities: {
        authentication_failure_close: boolean,
        'basic.nack': boolean,
        'connection.blocked': boolean,
        consumer_cancel_notify: boolean,
        exchange_exchange_bindings: boolean,
        publisher_confirms: boolean
      },
      information: string,
      platform: string,
      product: string,
      version: string
    },
    connected_at: number,
    frame_max: number,
    garbage_collection: {
      fullsweep_after: number,
      max_heap_size: number,
      min_bin_vheap_size: number,
      min_heap_size: number,
      minor_gcs: number
    },
    host: string,
    name: string,
    node: string,
    peer_cert_issuer: any,
    peer_cert_subject: any,
    peer_cert_validity: any,
    peer_host: string,
    peer_port: number,
    port: number,
    protocol: string,
    recv_cnt: number,
    recv_oct: number,
    recv_oct_details: {
      rate: number
    },
    reductions: number,
    reductions_details: {
      rate: number
    },
    send_cnt: number,
    send_oct: number,
    send_oct_details: {
      rate: number
    },
    send_pend: number,
    ssl: boolean,
    ssl_cipher: any,
    ssl_hash: any,
    ssl_key_exchange: any,
    ssl_protocol: any,
    state: string,
    timeout: number,
    type: number,
    user: string,
    user_who_performed_action: string,
    vhost: string
  }

}
