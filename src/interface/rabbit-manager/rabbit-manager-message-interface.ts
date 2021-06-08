export interface RabbitManagerMessageInterface {

  sendMessageToExchange(vhost: string, exchange: string, message: any): Promise<any>

}
