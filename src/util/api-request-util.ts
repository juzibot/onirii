import { curly, HeaderInfo } from 'node-libcurl';
import { CurlyOptions } from 'node-libcurl/dist/curly';
import * as querystring from 'querystring';
import { LogFactory } from '../factory/log-factory';

export class ApiRequestUtil {
  // logger
  private static readonly logger = LogFactory.getLogger('api-requester');
  //
  private static readonly apiRequestLogVerbose: boolean =
      !!(process.env.API_LOG_VERBOSE && process.env.API_LOG_VERBOSE !== 'false');

  public static async getRequest(url: string, jsonStringify = true, params?: {}, header?: string[]): Promise<any> {
    const { statusCode, data, headers } = await curly.get(url, this.generateOptions(jsonStringify, params, header));
    return this.analRs(url, params, header, statusCode, data, headers);
  }

  public static async postRequest(url: string, jsonStringify = true, params?: {}, header?: string[]): Promise<any> {
    const { statusCode, data, headers } = await curly.post(url, this.generateOptions(jsonStringify, params, header));
    return this.analRs(url, params, header, statusCode, data, headers);
  }


  public static async putRequest(url: string, jsonStringify = true, params?: {}, header?: string[]): Promise<any> {
    const { statusCode, data, headers } = await curly.put(url, this.generateOptions(jsonStringify, params, header));
    return this.analRs(url, params, header, statusCode, data, headers);
  }

  public static async deleteRequest(url: string, jsonStringify = true, params?: {}, header?: string[]): Promise<any> {
    const { statusCode, data, headers } = await curly.delete(url, this.generateOptions(jsonStringify, params, header));
    return this.analRs(url, params, header, statusCode, data, headers);
  }

  private static generateOptions(jsonStringify: boolean, params: {} | undefined, header: string[] | undefined): CurlyOptions {
    const options: CurlyOptions = {};
    if (params) {
      options.postFields = jsonStringify ? JSON.stringify(params) : querystring.stringify(params);
    }
    if (header) {
      options.httpHeader = header;
    }
    return options;
  }

  public static mergeHeader(arg1: string[], ...args: string[]) {
    return arg1.push(...args);
  }

  public static analRs(url: string, params: {} | undefined, header: string[] | undefined, code: number, data: any, rsHeader: HeaderInfo[]) {
    if (code === 200) {
      // success
      return data;
    } else if (code === 201) {
      // created
      return code;
    } else if (code === 204) {
      this.logger.error('Operation Not Effected May Resource Already Exist');
      return code;
    }
    // error log
    if (this.apiRequestLogVerbose) {
      this.printDetailLog('DELETE', url, params, header, code, data, rsHeader);
      return;
    }
    this.logger.error(`Request ${url} with param:${JSON.stringify(params)} Got Error Code: ${code}`);
  }

  private static printDetailLog(
      requestType: string,
      url: string,
      params: {} | undefined,
      requestHeader: string[] | undefined,
      statusCode: number,
      data: any, headers: HeaderInfo[],
  ) {
    this.logger.error(`Api Request Got Error: 
          ${requestType} -- ${url}
          params: ${JSON.stringify(params) || ''}
          request header: ${requestHeader}
          response code: ${statusCode}
          response data: ${data}
          response headers: ${JSON.stringify(headers)}`);
  }

}
