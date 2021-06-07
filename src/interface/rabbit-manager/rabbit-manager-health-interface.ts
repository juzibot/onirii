/**
 * Rabbit manager health check interface
 *
 * @since 1.0.0
 * @date 2021-06-01
 * @author Luminous
 */
import { RMHealth } from '../../model/rabbit-manager/rabbit-manager-health-namespace';

/**
 * Rabbit Manager Health Interface
 *
 * @since 1.0.0
 * @date 2021-05-31
 * @author Luminous(BGLuminous)
 */
export interface RabbitManagerHealthInterface {
  /**
   * Get all system alarms
   *
   * @return {Promise<any>} if cant connect to server specific return [false]
   */
  checkAlarms(): Promise<any>;

  /**
   * Check all local alarms
   *
   * @return {Promise<any>} if cant connect to server specific return [false]
   */
  checkLocalAlarms(): Promise<any>;

  /**
   * Check Certificate
   *
   * @param {number} leftTime left expire time
   * @param {"days" | "weeks" | "months" | "years"} unit time unit
   * @return {Promise<any>} if cant connect to server specific return [false]
   */
  checkCertificate(leftTime: number, unit: 'days' | 'weeks' | 'months' | 'years'): Promise<any>;

  /**
   * Check port health
   *
   * @param {number} port target port
   * @return {Promise<HealthCheckPortRs | boolean>} if cant connect to server specific return [false]
   */
  checkPortHealth(port: number): Promise<RMHealth.HealthCheckPortRs | boolean>;

  /**
   * check server protocol status
   *
   * @param {"amqp091" | "amqp10" | "mqtt" | "stomp" | "web-mqtt" | "web-stomp"} name target protocol
   * @return {Promise<HealthCheckProtocolRs | boolean>} if cant connect to server specific return [false]
   */
  checkProtocol(name: 'amqp091' | 'amqp10' | 'mqtt' | 'stomp' | 'web-mqtt' | 'web-stomp')
    : Promise<RMHealth.HealthCheckProtocolRs | boolean>;

  /**
   * Check all vhost status
   *
   * @return {Promise<any>} if cant connect to server specific return [false]
   */
  checkVirtualHosts(): Promise<any>;

  /**
   * Check node mirror sync status
   *
   * @return {Promise<HealthCheckBaseRs | boolean>} if cant connect to server specific return [false]
   */
  checkNodeMirrorSyncCritical(): Promise<RMHealth.HealthCheckBaseRs | boolean>;

  /**
   * Check node quorum status
   *
   * @return {Promise<HealthCheckBaseRs | boolean>} if cant connect to server specific return [false]
   */
  checkNodeQuorumCritical(): Promise<RMHealth.HealthCheckBaseRs | boolean>;

}
