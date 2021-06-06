import { Logger } from 'log4js';
import { LogFactory } from '../../factory/log-factory';
import { RabbitManagerExchangeInterface } from '../../interface/rabbit-manager/rabbit-manager-exchange-interface';
import { RabbitManagerHealthInterface } from '../../interface/rabbit-manager/rabbit-manager-health-interface';
import { RabbitManagerQueueInterface } from '../../interface/rabbit-manager/rabbit-manager-queue-interface';
import { RabbitManagerVhostInterface } from '../../interface/rabbit-manager/rabbit-manager-vhost-interface';
import { RabbitRequestPaginationParams } from '../../model/rabbit-request-params-model';
import {
  CreateVhostParams,
  Exchange,
  ExchangeStatusRsModel,
  HealthCheckBaseRs,
  HealthCheckPortRs,
  HealthCheckProtocolRs,
  vhostChannelRs,
  vhostConnectionsRs,
  vhostDataModel,
} from '../../model/rebbit-manager-model';
import { ApiRequestUtil } from '../../util/api-request-util';
import { RabbitManagerResponseUtil } from '../../util/api-response/rabbit-manager-response-util';

export class RabbitManagerService implements RabbitManagerHealthInterface, RabbitManagerVhostInterface,
    RabbitManagerExchangeInterface, RabbitManagerQueueInterface {
  // logger
  private readonly logger: Logger;

  private readonly managerApi: string;

  private readonly managerAuth: string;

  private readonly instanceName: string;

  private readonly apiRequester: ApiRequestUtil;

  constructor(name: string, managerApi: string, auth: string) {
    this.instanceName = name;
    this.logger = LogFactory.create(`${this.instanceName}-manager-service`);
    this.apiRequester = new ApiRequestUtil(new RabbitManagerResponseUtil(this.logger));
    this.managerApi = managerApi;
    this.managerAuth = `Authorization: Basic ${Buffer.from(auth).toString('base64')}`;
  }

  public async ready(check = true) {
    if (check) {
      await this.checkAlarms();
    }
  }

  async checkAlarms(): Promise<any> {
    return await this.apiRequester.getRequest(
        `${this.managerApi}/health/checks/alarms`,
        undefined,
        [this.managerAuth],
    );
  }

  async checkLocalAlarms(): Promise<any> {
    return await this.apiRequester.getRequest(
        `${this.managerApi}/health/checks/local-alarms`,
        undefined,
        [this.managerAuth],
    );
  }

  async checkCertificate(leftTime: number, unit: 'days' | 'weeks' | 'months' | 'years'): Promise<any> {
    return await this.apiRequester.getRequest(
        `${this.managerApi}/health/checks/certificate-expiration/${leftTime}/${unit}`,
        undefined,
        [this.managerAuth],
    );
  }

  async checkPortHealth(port: number): Promise<HealthCheckPortRs> {
    return await this.apiRequester.getRequest(
        `${this.managerApi}/health/checks/port-listener/${port}`,
        undefined,
        [this.managerAuth],
    );
  }

  async checkNodeMirrorSyncCritical(): Promise<HealthCheckBaseRs> {
    return await this.apiRequester.getRequest(
        `${this.managerApi}/health/checks/node-is-mirror-sync-critical`,
        undefined,
        [this.managerAuth],
    );
  }

  async checkNodeQuorumCritical(): Promise<HealthCheckBaseRs> {
    return await this.apiRequester.getRequest(
        `${this.managerApi}/health/checks/node-is-quorum-critical`,
        undefined,
        [this.managerAuth],
    );
  }

  async checkProtocol(name: 'amqp091' | 'amqp10' | 'mqtt' | 'stomp' | 'web-mqtt' | 'web-stomp'): Promise<HealthCheckProtocolRs> {
    return await this.apiRequester.getRequest(
        `${this.managerApi}/health/checks/protocol-listener/${name}`,
        undefined,
        [this.managerAuth],
    );
  }

  checkVirtualHosts(): Promise<any> {
    return this.apiRequester.getRequest(
        `${this.managerApi}/health/checks/virtual-hosts`,
        undefined,
        [this.managerAuth],
    );
  }

  async createVhost(name: string, params?: CreateVhostParams): Promise<boolean> {
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
   * Delete Vhost
   *
   * Note::If checkImmediately = false this method will always return true
   *
   * @param {string} name target vhost name
   * @param {boolean} checkImmediately check deleted?
   * @param {CreateVhostParams} params delete options
   * @return {Promise<boolean>}
   */
  async deleteVhost(name: string, checkImmediately = false, params?: CreateVhostParams): Promise<boolean> {
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

  public async getVhost(): Promise<vhostDataModel[]>;
  public async getVhost(name: string): Promise<vhostDataModel | boolean>;
  public async getVhost(name?: string): Promise<vhostDataModel[] | vhostDataModel | boolean> {
    return await this.apiRequester.getRequest(
        `${this.managerApi}/vhosts${name ? `/${name}` : ''}`,
        undefined,
        [this.managerAuth],
    );
  }

  async getVhostConnection(name: string): Promise<vhostConnectionsRs[]> {
    return await this.apiRequester.getRequest(
        `${this.managerApi}/vhosts/${name}/connections`,
        undefined,
        [this.managerAuth],
    );
  }

  async getVhostOpenChannels(name: string, options?: RabbitRequestPaginationParams): Promise<vhostChannelRs[]> {
    return await this.apiRequester.getRequest(
        `${this.managerApi}/vhosts/${name}/channels`,
        options,
        [this.managerAuth],
    );
  }

  async startNode(vhostName: string, nodeName: string): Promise<any> {
    return await this.apiRequester.postRequest(
        `${this.managerApi}/vhosts/${vhostName}/start/${nodeName}`,
        true,
        undefined,
        [this.managerAuth],
    );
  }

  public async getExchange(): Promise<ExchangeStatusRsModel[]>;
  public async getExchange(vhost: string): Promise<ExchangeStatusRsModel[]>;
  public async getExchange(vhost: string, name: string): Promise<ExchangeStatusRsModel | boolean>
  public async getExchange(vhost?: string, name?: string): Promise<ExchangeStatusRsModel[] | ExchangeStatusRsModel | boolean> {
    if (!vhost && name) {
      throw new Error('Must Specific Vhost When Getting Current Exchange');
    }
    return await this.apiRequester.getRequest(
        `${this.managerApi}/exchanges${vhost ? `/${vhost}` : ''}${name ? `/${name}` : ''}`,
        undefined,
        [this.managerAuth],
    );
  }

  public async createExchange(vhost: string, name: string, options: Exchange.CreateOptions): Promise<boolean> {
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
   * @param {Exchange.DeleteOptions} options delete options
   * @return {Promise<boolean>}
   */
  public async deleteExchange(vhost: string, name: string, checkImmediately = false, options?: Exchange.DeleteOptions): Promise<boolean> {
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
