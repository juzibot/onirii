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
export interface HealthCheckPortRs extends HealthCheckBaseRs{
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

export interface CreateVHostParams {
  description?: string,
  tags?: string,
}

export interface vHostDataModel {
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
