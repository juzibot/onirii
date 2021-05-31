import { HeaderInfo } from 'node-libcurl';

/**
 * ApiRequest Util Response Analysis Interface
 *
 * @since 1.0.0
 * @date 2021-05-31
 * @author Luminous(BGLuminous)
 */
export interface ResponseAnalysisInterface {

  /**
   * analysis api get response
   *
   * @return {Promise<void>}
   */
  analGet(url: string, params: {} | undefined, header: string[] | undefined, code: number, data: any, rsHeader: HeaderInfo[]): Promise<any>;

  /**
   * analysis api post response
   * @return {Promise<void>}
   */
  analPost(url: string, params: {} | undefined, header: string[] | undefined, code: number, data: any, rsHeader: HeaderInfo[]): Promise<any>;

  /**
   * analysis api put response
   * @return {Promise<void>}
   */
  analPut(url: string, params: {} | undefined, header: string[] | undefined, code: number, data: any, rsHeader: HeaderInfo[]): Promise<any>;

  /**
   * analysis api delete response
   * @return {Promise<void>}
   */
  analDelete(url: string, params: {} | undefined, header: string[] | undefined, code: number, data: any, rsHeader: HeaderInfo[]): Promise<any>;

}
