/**
 * Rabbit Public Namespace
 *
 * @since 1.0.0
 * @date 2021-06-07
 * @author Luminous (BGLuminous)
 */
export namespace RabbitManager {

  /**
   * Rabbit Public Pagination Params
   */
  export interface PaginationParams {
    page?: number,
    page_size?: number,
    name?: string
    use_regex?: boolean
  }

}
