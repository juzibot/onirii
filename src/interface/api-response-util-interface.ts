/**
 * ApiRequest Util Response Analysis Interface
 *
 * @since 1.0.0
 * @date 2021-05-31
 * @author Luminous(BGLuminous)
 */
export interface ApiResponseUtilInterface {

  /**
   * analysis api get response
   *
   * @return {<void>}
   */
  analGet(url: string, params: {} | undefined, headers: any | undefined, code: number, data: any, rsHeader?: any): any;

  /**
   * analysis api post response
   * @return {<void>}
   */
  analPost(url: string, params: {} | undefined, headers: any | undefined, code: number, data: any, rsHeader: any): any;

  /**
   * analysis api put response
   * @return {<void>}
   */
  analPut(url: string, params: {} | undefined, headers: any | undefined, code: number, data: any, rsHeader: any): any;

  /**
   * analysis api delete response
   * @return {<void>}
   */
  analDelete(url: string, params: {} | undefined, headers: any | undefined, code: number, data: any, rsHeader: any): any;

}
