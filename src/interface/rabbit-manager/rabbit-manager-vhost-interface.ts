import { RMChannel } from '../../model/rabbit-manager/rabbit-manager-channel-namespace';
import { RMConnect } from '../../model/rabbit-manager/rabbit-manager-connect-namespace';
import { RMVhost } from '../../model/rabbit-manager/rabbit-manager-vhost-namespace';
import { RabbitManager } from '../../model/rabbit-manager/rebbit-manager-namespace';

/**
 * Rabbit Manager Vhost Part Interface
 *
 * @since 1.0.0
 * @date 2021-05-31
 * @author Luminous(BGLuminous)
 */
export interface RabbitManagerVhostInterface {

  /**
   * Get vhost status
   *
   * @return {Promise<>} if cant connect to server or vhost not exist specific return [false]
   */
  getVhost(name?: string): Promise<RMVhost.VhostDataModel[] | RMVhost.VhostDataModel | boolean>;

  /**
   * Get vhost all connection list
   *
   * @param {string} name vhost name
   * @return {Promise<RMConnect.VhostConnectionsStatus[] | boolean>} if cant connect to server or vhost not exist specific return [false]
   */
  getVhostConnection(name: string): Promise<RMConnect.VhostConnectionsStatus[] | boolean>;

  /**
   * Get vhost all opening channel list
   *
   * @param {string} name vhost name
   * @param {RabbitManager.PaginationParams} options paginationParams
   * @return {Promise<RMChannel.VhostChannelStatus[] | boolean>} if cant connect to server or vhost not exist specific return [false]
   */
  getVhostOpenChannels(name: string, options: RabbitManager.PaginationParams): Promise<RMChannel.VhostChannelStatus[] | boolean>;

  /**
   * Create a new vhost
   *
   * @param {string} name vhost name
   * @param {CreateVhostParams} params create options
   * @return {Promise<boolean>}
   */
  createVhost(name: string, params?: RMVhost.CreateVhostParams): Promise<boolean>;

  /**
   * Delete vhost
   *
   * Note::If checkImmediately = false this method will always return true
   *
   * @param {string} name target vhost name
   * @param {boolean} checkImmediately check deleted?
   * @param {CreateVhostParams} params delete options
   * @return {Promise<boolean>}
   */
  deleteVhost(name: string, checkImmediately?: boolean, params?: any): Promise<boolean>;

  /**
   * Start rabbit node
   * @param {string} vhostName target vhost name
   * @param {string} nodeName target node name
   * @return {Promise<any>}
   */
  startNode(vhostName: string, nodeName: string): Promise<any>;
}
