/**
 *
 */
export interface AmqpConfirmChannelInterface {

  /**
   *
   * @return {Promise<void>}
   */
  waitForConfirms(): Promise<void>;

}
