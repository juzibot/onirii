export interface RabbitMqServiceExtends {

  createVhost(name: string): string,

  createQueueByApi(name: string): string,

}