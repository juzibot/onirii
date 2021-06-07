import { RMExchange } from '../../model/rabbit-manager/rabbit-manager-exchange-namespace';


export interface RabbitManagerExchangeInterface {

  /**
   * Get exchange status
   *
   * @return {Promise<RMExchange.ExchangeStatusModel[] | RMExchange.ExchangeStatusModel | boolean>} if cant connect to server or exchange    not exist specific return [false]
   */
  getExchange(vhost?: string, name?: string): Promise<RMExchange.ExchangeStatusModel[] | RMExchange.ExchangeStatusModel | boolean>;

  /**
   * Create exchange
   *
   * @param {string} vhost target vhost
   * @param {string} name new exchange name
   * @param {RMExchange.CreateOptions} options create exchange options
   * @return {Promise<boolean>} if already exist return false and print warn
   */
  createExchange(vhost: string, name: string, options?: any): Promise<boolean>;

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
  deleteExchange(vhost: string, name: string, checkImmediately?: boolean, options?: RMExchange.DeleteOptions): Promise<boolean>;

}
