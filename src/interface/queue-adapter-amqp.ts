export interface QueueAdapterAmqp {

  assertQueue(): void,

  checkQueue(): void,

  deleteQueue(): void,

  purgeQueue(): void,

  bindQueue(): void,

  unbindQueue(): void,

}