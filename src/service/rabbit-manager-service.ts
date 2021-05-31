import { Logger } from 'log4js';
import { PublicConfigLoader } from '../config/public-config-loader';
import { LogFactory } from '../factory/log-factory';
import { RabbitManagerVhostInterface } from '../interface/api/rabbit-manager/rabbit-manager-vhost-interface';
import { RabbitManagerHealthInterface } from '../interface/api/rabbit-manager/rabbit-manager-health-interface';
import {
  CreateVHostParams,
  HealthCheckBaseRs,
  HealthCheckPortRs,
  HealthCheckProtocolRs,
  vHostDataModel,
} from '../model/rebbit-manager-model';
import { ApiRequestUtil } from '../util/api-request-util';
import { RabbitNativeService } from './rabbit-native-service';

export class RabbitManagerService extends RabbitNativeService implements RabbitManagerHealthInterface, RabbitManagerVhostInterface {
  // logger
  private readonly managerLogger: Logger | undefined;
  // manager api url
  private readonly managerApi: string | undefined;
  // manager api auth
  private readonly auth: string | undefined;

  constructor(name: string, amqpUrl?: string, managerApi?: string, auth?: string) {
    super(name, amqpUrl);
    this.managerLogger = LogFactory.flush(`${name}-manager`);
    if ((!managerApi || !auth) && !this.config) {
      this.config = PublicConfigLoader.getNecessaryConfig(name);
    }
    this.managerApi = managerApi || this.config!.managerUrl;
    this.auth = auth || this.config!.apiAuth;
    if (!this.managerApi || !this.auth) {
      throw new Error('');
    }
    this.auth = `Authorization: Basic ${Buffer.from(this.auth).toString('base64')}`;
  }

  public async ready(apiCheck = true, amqpOptions?: any): Promise<void> {
    await super.ready(amqpOptions);
    if (apiCheck) {
      this.managerLogger!.info(`Testing Manager Server(Health Check): ${this.managerApi}`);
      await this.checkAlarms();
    }
  }

  async checkAlarms(): Promise<any> {
    return await ApiRequestUtil.getRequest(
        `${this.managerApi}/health/checks/alarms`,
        true,
        undefined,
        [this.auth!],
    );
  }

  async checkLocalAlarms(): Promise<any> {
    return await ApiRequestUtil.getRequest(
        `${this.managerApi}/health/checks/local-alarms`,
        true,
        undefined,
        [this.auth!],
    );
  }

  async checkCertificate(leftTime: number, unit: 'days' | 'weeks' | 'months' | 'years'): Promise<any> {
    return await ApiRequestUtil.getRequest(
        `${this.managerApi}/health/checks/certificate-expiration/${leftTime}/${unit}`,
        true,
        undefined,
        [this.auth!],
    );
  }

  async checkPortHealth(port: number): Promise<HealthCheckPortRs> {
    return await ApiRequestUtil.getRequest(
        `${this.managerApi}/health/checks/port-listener/${port}`,
        true,
        undefined,
        [this.auth!],
    );
  }

  async checkNodeMirrorSyncCritical(): Promise<HealthCheckBaseRs> {
    return await ApiRequestUtil.getRequest(
        `${this.managerApi}/health/checks/node-is-mirror-sync-critical`,
        true,
        undefined,
        [this.auth!],
    );
  }

  async checkNodeQuorumCritical(): Promise<HealthCheckBaseRs> {
    return await ApiRequestUtil.getRequest(
        `${this.managerApi}/health/checks/node-is-quorum-critical`,
        true,
        undefined,
        [this.auth!],
    );
  }

  async checkProtocol(name: 'amqp091' | 'amqp10' | 'mqtt' | 'stomp' | 'web-mqtt' | 'web-stomp'): Promise<HealthCheckProtocolRs> {
    return await ApiRequestUtil.getRequest(
        `${this.managerApi}/health/checks/protocol-listener/${name}`,
        true,
        undefined,
        [this.auth!],
    );
  }

  checkVirtualHosts(): Promise<any> {
    return ApiRequestUtil.getRequest(
        `${this.managerApi}/health/checks/virtual-hosts`,
        true,
        undefined,
        [this.auth!],
    );
  }

  async createVhost(name: string, params: CreateVHostParams): Promise<boolean> {
    const rs = await ApiRequestUtil.putRequest(
        `${this.managerApi}/vhosts/${name}`,
        true,
        params,
        [this.auth!],
    );
    return rs === 201;
  }

  async deleteVHost(name: string, params: CreateVHostParams): Promise<boolean> {
    const rs = await ApiRequestUtil.getRequest(
        `${this.managerApi}/vhosts/${name}`,
        true,
        params,
        [this.auth!],
    );
    return rs === 0;
  }

  async getVhost(name?: string): Promise<vHostDataModel[] | vHostDataModel> {
    return await ApiRequestUtil.getRequest(
        `${this.managerApi}/vhosts${name ? `/${name}` : ''}`,
        true,
        undefined,
        [this.auth!],
    );
  }


}
