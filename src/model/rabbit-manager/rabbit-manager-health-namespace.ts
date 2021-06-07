/**
 * Rabbit Manager Health Namespace
 *
 * @since 1.0.0
 * @date 2021-06-07
 * @author Luminous(BGLuminous)
 */
export namespace RMHealth {
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

}
