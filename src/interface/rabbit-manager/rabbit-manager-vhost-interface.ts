import { RabbitRequestPaginationParams } from '../../model/rabbit-request-params-model';
import {
  CreateVhostParams,
  vhostChannelRs,
  vhostConnectionsRs,
  vhostDataModel,
} from '../../model/rebbit-manager-model';

export interface RabbitManagerVhostInterface {

  getVhost(name?: string): Promise<vhostDataModel[] | vhostDataModel>;

  getVhostConnection(name: string): Promise<vhostConnectionsRs[]>;

  getVhostOpenChannels(name: string, options: RabbitRequestPaginationParams): Promise<vhostChannelRs[]>;

  createVhost(name: string, params?: CreateVhostParams): Promise<boolean>;

  deleteVhost(name: string, params?: CreateVhostParams): Promise<boolean>;

  startNode(vhostName: string, nodeName: string): Promise<any>;
}
