export interface RebbitManagerModel {

}

/**
 * Manager Health Check Base Response
 */
export interface HealthCheckBaseRs {
  status: string,
  reason?: string
}

/**
 * Port Health Check Response Model
 */
export interface HealthCheckPortRs extends HealthCheckBaseRs {
  missing: number,
  ports?: number[] | number
  error?: string
}

/**
 * Protocol Health Check Response Model
 */
export interface HealthCheckProtocolRs extends HealthCheckBaseRs {
  protocol?: string,
  protocols?: string[],
  missing?: string
}

/**
 *
 */
export interface CreateVhostParams {
  description?: string,
  tags?: string,
}

export interface vhostDataModel {
  cluster_state: any,
  description: string,
  metadata: {
    description?: string,
    tags?: string[]
  },
  name: string,
  recv_oct: number,
  recv_oct_details: {
    rate: number
  },
  send_oct: number,
  send_oct_details: {
    rate: number
  },
  tags: string[],
  tracing: boolean
}

export interface vhostConnectionsRs {
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

export interface vhostChannelRs {
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
