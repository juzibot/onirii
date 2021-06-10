import { Logger } from 'log4js';
import { LogFactory } from '../../factory/log-factory';
import { RabbitManagerExchangeInterface } from '../../interface/rabbit-manager/rabbit-manager-exchange-interface';
import { RabbitManagerHealthInterface } from '../../interface/rabbit-manager/rabbit-manager-health-interface';
import { RabbitManagerQueueInterface } from '../../interface/rabbit-manager/rabbit-manager-queue-interface';
import { RabbitManagerVhostInterface } from '../../interface/rabbit-manager/rabbit-manager-vhost-interface';
import { RMChannel } from '../../model/rabbit-manager/rabbit-manager-channel-namespace';
import { RMConnect } from '../../model/rabbit-manager/rabbit-manager-connect-namespace';
import { RMExchange } from '../../model/rabbit-manager/rabbit-manager-exchange-namespace';
import { RMHealth } from '../../model/rabbit-manager/rabbit-manager-health-namespace';
import { RMVhost } from '../../model/rabbit-manager/rabbit-manager-vhost-namespace';
import { RabbitManager } from '../../model/rabbit-manager/rebbit-manager-namespace';
import { ApiRequestUtil } from '../../util/api-request-util';
import { RabbitManagerResponseUtil } from '../../util/api-response/rabbit-manager-response-util';
import { EnvLoaderUtil } from '../../util/env-loader-util';

export class RabbitManagerService implements RabbitManagerHealthInterface, RabbitManagerVhostInterface,
  RabbitManagerExchangeInterface, RabbitManagerQueueInterface {
  // logger
  private readonly logger: Logger;
  // manager api
  private readonly managerApi: string | undefined;
  // manager api basic auth
  private readonly managerAuth: string;
  // manger service identify name
  private readonly instanceName: string;
  // current manager api requester (include response analyzer)
  private readonly apiRequester: ApiRequestUtil;

  /**
   * Constructor
   *
   * @param {string} name identify name
   * @param {string} managerApi manager api
   * @param {string} auth manager auth
   */
  constructor(name: string, managerApi?: string, auth?: string) {
    this.instanceName = name;
    this.logger = LogFactory.create(`${this.instanceName}-manager-service`);
    this.apiRequester = new ApiRequestUtil(new RabbitManagerResponseUtil(this.logger));
    this.managerApi = managerApi;
    if (!this.managerApi) {
      this.managerApi = EnvLoaderUtil.getInstance().getPublicConfig().managerApiUrl;
    }
    let currentAuth = auth;
    if (!currentAuth) {
      currentAuth = EnvLoaderUtil.getInstance().getPublicConfig().managerAuth;
    }
    if (!this.managerApi || !currentAuth) {
      throw new Error('Must Specific Manager ApiUrl And Auth, You Can Defined At Env Or Params');
    }
    this.managerAuth = `Authorization: Basic ${Buffer.from(currentAuth).toString('base64')}`;
  }

  /**
   * Check target manager service status, this method is not a necessary init method just for check
   *
   * @return {Promise<void>}
   */
  public async ready(): Promise<boolean> {
    return await this.checkAlarms() !== false;
  }

  /**
   * Get all system alarms
   *
   * @return {Promise<any>} if cant connect to server specific return [false]
   */
  async checkAlarms(): Promise<any> {
    return this.apiRequester.getRequest(
      `${this.managerApi}/health/checks/alarms`,
      undefined,
      [this.managerAuth],
    );
  }

  /**
   * Check all local alarms
   *
   * @return {Promise<any>} if cant connect to server specific return [false]
   */
  async checkLocalAlarms(): Promise<any> {
    return this.apiRequester.getRequest(
      `${this.managerApi}/health/checks/local-alarms`,
      undefined,
      [this.managerAuth],
    );
  }

  /**
   * Check Certificate
   *
   * @param {number} leftTime left expire time
   * @param {"days" | "weeks" | "months" | "years"} unit time unit
   * @return {Promise<any>} if cant connect to server specific return [false]
   */
  async checkCertificate(leftTime: number, unit: 'days' | 'weeks' | 'months' | 'years'): Promise<any> {
    return this.apiRequester.getRequest(
      `${this.managerApi}/health/checks/certificate-expiration/${leftTime}/${unit}`,
      undefined,
      [this.managerAuth],
    );
  }

  /**
   * Check port health
   *
   * @param {number} port target port
   * @return {Promise<HealthCheckPortRs | boolean>} if cant connect to server specific return [false]
   */
  async checkPortHealth(port: number): Promise<RMHealth.HealthCheckPortRs | boolean> {
    return this.apiRequester.getRequest(
      `${this.managerApi}/health/checks/port-listener/${port}`,
      undefined,
      [this.managerAuth],
    );
  }

  /**
   * Check node mirror sync status
   *
   * @return {Promise<HealthCheckBaseRs | boolean>} if cant connect to server specific return [false]
   */
  async checkNodeMirrorSyncCritical(): Promise<RMHealth.HealthCheckBaseRs | boolean> {
    return this.apiRequester.getRequest(
      `${this.managerApi}/health/checks/node-is-mirror-sync-critical`,
      undefined,
      [this.managerAuth],
    );
  }

  /**
   * Check node quorum status
   *
   * @return {Promise<HealthCheckBaseRs | boolean>} if cant connect to server specific return [false]
   */
  async checkNodeQuorumCritical(): Promise<RMHealth.HealthCheckBaseRs> {
    return this.apiRequester.getRequest(
      `${this.managerApi}/health/checks/node-is-quorum-critical`,
      undefined,
      [this.managerAuth],
    );
  }

  /**
   * check server protocol status
   *
   * @param {"amqp091" | "amqp10" | "mqtt" | "stomp" | "web-mqtt" | "web-stomp"} name target protocol
   * @return {Promise<HealthCheckProtocolRs | boolean>} if cant connect to server specific return [false]
   */
  public async checkProtocol(name: 'amqp091' | 'amqp10' | 'mqtt' | 'stomp' | 'web-mqtt' | 'web-stomp'): Promise<RMHealth.HealthCheckProtocolRs | boolean> {
    return this.apiRequester.getRequest(
      `${this.managerApi}/health/checks/protocol-listener/${name}`,
      undefined,
      [this.managerAuth],
    );
  }

  /**
   * Check all vhost status
   *
   * @return {Promise<any>} if cant connect to server specific return [false]
   */
  checkVirtualHosts(): Promise<any> {
    return this.apiRequester.getRequest(
      `${this.managerApi}/health/checks/virtual-hosts`,
      undefined,
      [this.managerAuth],
    );
  }

  /**
   * Create a new vhost
   *
   * @param {string} name vhost name
   * @param {CreateVhostParams} params create options
   * @return {Promise<boolean>}
   */
  async createVhost(name: string, params?: RMVhost.CreateVhostParams): Promise<boolean> {
    const rs = await this.apiRequester.putRequest(
      `${this.managerApi}/vhosts/${name}`,
      true,
      params,
      [this.managerAuth],
    );
    if (!rs) {
      this.logger.warn(`Target VHost Already Exist:${name}`);
    }
    return rs;
  }

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
  async deleteVhost(name: string, checkImmediately = false, params?: any): Promise<boolean> {
    const rs = await this.apiRequester.deleteRequest(
      `${this.managerApi}/vhosts/${name}`,
      params,
      [this.managerAuth],
    );
    if (checkImmediately) {
      return await this.getVhost(name) === false;
    }
    return rs;
  }

  /**
   * Get vhost status
   *
   * @return {Promise<>} if cant connect to server or vhost not exist specific return [false]
   */
  public async getVhost(): Promise<RMVhost.VhostDataModel[]>;
  public async getVhost(name: string): Promise<RMVhost.VhostDataModel | boolean>;
  public async getVhost(name?: string): Promise<RMVhost.VhostDataModel[] | RMVhost.VhostDataModel | boolean> {
    return this.apiRequester.getRequest(
      `${this.managerApi}/vhosts${name ? `/${name}` : ''}`,
      undefined,
      [this.managerAuth],
    );
  }

  /**
   * Get vhost all connection list
   *
   * @param {string} name vhost name
   * @return {Promise<RMConnect.VhostConnectionsStatus[] | boolean>} if cant connect to server or vhost not exist specific return [false]
   */
  async getVhostConnection(name: string): Promise<RMConnect.VhostConnectionsStatus[] | boolean> {
    return this.apiRequester.getRequest(
      `${this.managerApi}/vhosts/${name}/connections`,
      undefined,
      [this.managerAuth],
    );
  }

  /**
   * Get vhost all opening channel list
   *
   * @param {string} name vhost name
   * @param {RabbitManager.PaginationParams} options paginationParams
   * @return {Promise<RMChannel.VhostChannelStatus[] | boolean>} if cant connect to server or vhost not exist specific return [false]
   */
  async getVhostOpenChannels(name: string, options?: RabbitManager.PaginationParams): Promise<RMChannel.VhostChannelStatus[] | boolean> {
    return this.apiRequester.getRequest(
      `${this.managerApi}/vhosts/${name}/channels`,
      options,
      [this.managerAuth],
    );
  }

  /**
   * Start rabbit node
   * @param {string} vhostName target vhost name
   * @param {string} nodeName target node name
   * @return {Promise<any>}
   */
  async startNode(vhostName: string, nodeName: string): Promise<any> {
    return this.apiRequester.postRequest(
      `${this.managerApi}/vhosts/${vhostName}/start/${nodeName}`,
      true,
      undefined,
      [this.managerAuth],
    );
  }

  /**
   * Get exchange status
   *
   * @return {Promise<RMExchange.ExchangeStatusModel[] | RMExchange.ExchangeStatusModel | boolean>} if cant connect to server or exchange    not exist specific return [false]
   */
  public async getExchange(): Promise<RMExchange.ExchangeStatusModel[]>;
  public async getExchange(vhost: string): Promise<RMExchange.ExchangeStatusModel[]>;
  public async getExchange(vhost: string, name: string): Promise<RMExchange.ExchangeStatusModel | boolean>
  public async getExchange(vhost?: string, name?: string)
    : Promise<RMExchange.ExchangeStatusModel[] | RMExchange.ExchangeStatusModel | boolean> {
    if (!vhost && name) {
      throw new Error('Must Specific Vhost When Getting Current Exchange');
    }
    const currentVhost = vhost ? `/${vhost}` : '';
    const currentName = name ? `/${name}` : '';
    return this.apiRequester.getRequest(
      `${this.managerApi}/exchanges${currentVhost}${currentName}`,
      undefined,
      [this.managerAuth],
    );
  }

  /**
   * Create exchange
   *
   * @param {string} vhost target vhost
   * @param {string} name new exchange name
   * @param {RMExchange.CreateOptions} options create exchange options
   * @return {Promise<boolean>} if already exist return false and print warn
   */
  public async createExchange(vhost: string, name: string, options: RMExchange.CreateOptions): Promise<boolean> {
    return await this.apiRequester.putRequest(
      `${this.managerApi}/exchanges/${vhost}/${name}`,
      true,
      options,
      [this.managerAuth],
    );
  }

  /**
   * Delete Exchange
   *
   * Note:: If checkImmediately = false this method will always return true
   *
   * @param {string} vhost target vhost name
   * @param {string} name target exchange name
   * @param {boolean} checkImmediately check deleted?
   * @param {RMExchange.DeleteOptions} options delete options
   * @return {Promise<boolean>}
   */
  public async deleteExchange(
    vhost: string,
    name: string,
    checkImmediately = false,
    options?: RMExchange.DeleteOptions,
  ): Promise<boolean> {
    const rs = await this.apiRequester.deleteRequest(
      `${this.managerApi}/exchanges/${vhost}/${name}`,
      options,
      [this.managerAuth],
    );
    if (checkImmediately) {
      return await this.getExchange(vhost, name) === false;
    }
    return rs;
  }

}
