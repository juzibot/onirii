/**
 * Public Config Model, This Current Mapper Environment
 */
export interface PublicConfigModel {
  // amqp server url
  amqpServerUrl?: string,
  // manager api url
  managerApiUrl?: string,
  // manager auth
  managerAuth?: string
  // each connect max channel count
  maxChannelCount?: number;
}
