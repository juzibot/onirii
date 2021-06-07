/**
 * Rabbit Manager Channel Namespace
 *
 * @since 1.0.0
 * @date 2021-06-07
 * @author Luminous(BGLuminous)
 */
export namespace RMChannel {

  /**
   * Vhost status response model
   */
  export interface vhostChannelStatus {
    acks_uncommitted: number,
    confirm: boolean,
    connection_details: {
      name: string,
      peer_host: string,
      peer_port: number
    },
    consumer_count: number,
    garbage_collection: {
      fullsweep_after: number,
      max_heap_size: number,
      min_bin_vheap_size: number,
      min_heap_size: number,
      minor_gcs: number
    },
    global_prefetch_count: number,
    idle_since: string,
    messages_unacknowledged: number,
    messages_uncommitted: number,
    messages_unconfirmed: number,
    name: string,
    node: string,
    number: number,
    pending_raft_commands: number,
    prefetch_count: number,
    reductions: number,
    reductions_details: {
      rate: number
    },
    state: string,
    transactional: boolean,
    user: string,
    user_who_performed_action: string,
    vhost: string
  }
}
