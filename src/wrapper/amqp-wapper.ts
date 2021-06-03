import * as amqp from 'amqplib';

/**
 * Amqp Original Channel Standard Data
 */
export class OriginalChannelWrapper {
  // amqp original channel instance
  public readonly channel: amqp.Channel;
  // current amqp original channel service instance identify name
  public readonly instanceName: string;

  /**
   * Constructor
   * @param {Channel} channel amqp original channel instance
   * @param {string} instanceName instance identify name
   */
  constructor(channel: amqp.Channel, instanceName: string) {
    this.channel = channel;
    this.instanceName = instanceName;
  }
}

/**
 * Amqp Original Channel Standard Data
 */
export class OriginalConfirmChannelWrapper {
  // amqp original channel instance
  public readonly channel: amqp.ConfirmChannel;
  // current amqp original channel service instance identify name
  public readonly instanceName: string;

  /**
   * Constructor
   * @param confirmChannel amqp original confirm channel instance
   * @param {string} instanceName instance identify name
   */
  constructor(confirmChannel: amqp.ConfirmChannel, instanceName: string) {
    this.instanceName = instanceName;
    this.channel = confirmChannel;
  }

}

