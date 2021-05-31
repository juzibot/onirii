import { CreateVHostParams, vHostDataModel } from '../model/rebbit-manager-model';

export interface RabbitManagerExtends {

  getVhost(name?: string): Promise<vHostDataModel[] | vHostDataModel>,

  createVhost(name: string, params: CreateVHostParams): Promise<boolean>,

  deleteVHost(name: string, params: CreateVHostParams): Promise<boolean>,

}
