import { Exchange, ExchangeStatusRsModel } from '../../model/rebbit-manager-model';

export interface RabbitManagerExchangeInterface {

  getExchange(vhost?: string, name?: string): Promise<ExchangeStatusRsModel[] | ExchangeStatusRsModel | boolean>;

  createExchange(vhost: string, name: string, options?: any): Promise<boolean>;

  deleteExchange(vhost: string, name: string, checkImmediately?: boolean, options?: Exchange.DeleteOptions): Promise<boolean>;

}
