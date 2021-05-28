import { RabbitManagerExtends } from '../interface/rabbit-manager-extends';
import { CreateVHostParams, vHostDataModel } from '../model/rebbit-mq-model';
import { ApiRequestUtil } from '../util/api-request-util';
import { RabbitImpl } from './rabbit-impl';

export class RabbitManagerImpl extends RabbitImpl implements RabbitManagerExtends {

  async createVhost(vHostName: string, params?: CreateVHostParams): Promise<boolean> {
    this.logger!.debug(`Instance ${this.name}-${this.queueType} Creating vhost`);
    const rs = await ApiRequestUtil.putRequest(
        `${this.api}/vhosts/${vHostName}`,
        true,
        params,
        [`Authorization: Basic ${this.auth}`],
    );
    return rs === 201;
  }

  async getVhost(name?: string): Promise<vHostDataModel[] | vHostDataModel> {
    this.verbose(`Getting vhost ${name ? `by: ${name}` : ''}`);
    return await ApiRequestUtil.getRequest(
        `${this.api}/vhosts${name ? `/${name}` : ''}`,
        true,
        undefined,
        [`Authorization: Basic ${this.auth}`],
    );
  }

  async deleteVHost(name: string, params: any): Promise<boolean> {
    this.verbose(`Deleting vhost ${name}`);
    const rs = await ApiRequestUtil.getRequest(
        `${this.api}/vhosts/${name}`,
        true,
        params,
        [`Authorization: Basic ${this.auth}`],
    );
    return rs === 0;
  }

}
