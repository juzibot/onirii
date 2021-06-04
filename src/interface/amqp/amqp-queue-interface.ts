import { Options, Replies } from 'amqplib/properties';

/**
 * Amqp Queue Operator Interface
 *
 * @since 1.0.0
 * @date 2021-06-01
 * @author Luminous(BGLuminous)
 */
export interface AmqpQueueInterface {

  /**
   * Create queue if not exist, always return queue status(same as getQueueStatus(name))
   *
   * @param {string} name
   * @param {Options.AssertQueue} options
   * @return {Promise<Replies.AssertQueue>}
   */
  createQueueIfNotExist(name: string, options?: Options.AssertQueue): Promise<Replies.AssertQueue>,

  /**
   * Get queue status
   *
   * @param {string} name
   * @return {Promise<Replies.AssertQueue>} queueName,message count,consumer count
   */
  getQueueStatus(name: string): Promise<Replies.AssertQueue>,

  /**
   * Bind queue to exchange with routerKey
   *
   * @param {string} name
   * @param {string} exchange
   * @param {string} bindKey
   * @param args
   * @return {Promise<Replies.Empty>} always empty
   */
  bindQueueToExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty>;

  /**
   * Unbind queue from exchange with current routerKey
   *
   * @param {string} name
   * @param {string} exchange
   * @param {string} bindKey
   * @param args
   * @return {Promise<Replies.Empty>} always empty
   */
  unbindQueueToExchange(name: string, exchange: string, bindKey: string, args?: any): Promise<Replies.Empty>,

  /**
   * Delete queue
   *
   * @param {string} name
   * @param {Options.DeleteQueue} options
   * @return {Promise<Replies.DeleteQueue>} deleted queue available message
   */
  deleteQueue(name: string, options?: Options.DeleteQueue): Promise<Replies.DeleteQueue>;

  /**
   * Deleted all message
   *
   * @param {string} name
   * @return {Promise<Replies.PurgeQueue>} deleted message count
   */
  purgeQueue(name: string): Promise<Replies.PurgeQueue>;

}
