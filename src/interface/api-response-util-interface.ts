import { HeaderInfo } from 'node-libcurl';

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
  analGet(url: string, params: {} | undefined, header: string[] | undefined, code: number, data: any, rsHeader: HeaderInfo[]): any;

  /**
   * analysis api post response
   * @return {<void>}
   */
  analPost(url: string, params: {} | undefined, header: string[] | undefined, code: number, data: any, rsHeader: HeaderInfo[]): any;

  /**
   * analysis api put response
   * @return {<void>}
   */
  analPut(url: string, params: {} | undefined, header: string[] | undefined, code: number, data: any, rsHeader: HeaderInfo[]): any;

  /**
   * analysis api delete response
   * @return {<void>}
   */
  analDelete(url: string, params: {} | undefined, header: string[] | undefined, code: number, data: any, rsHeader: HeaderInfo[]): any;

}
