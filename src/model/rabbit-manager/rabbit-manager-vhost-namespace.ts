/**
 * Rabbit Manager Vhost Namespace
 *
 * @since 1.0.0
 * @date 2021-06-07
 * @author Luminous(BGLuminous)
 */
export namespace RMVhost {

  /**
   * Create vhost request params
   */
  export interface CreateVhostParams {
    description?: string,
    tags?: string,
  }

  /**
   * Vhost status model
   */
  export interface VhostDataModel {
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

}
