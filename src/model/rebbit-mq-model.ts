export interface RebbitMqModel {

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
