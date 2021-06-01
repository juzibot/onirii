import { curly, HeaderInfo } from 'node-libcurl';
import { CurlyOptions } from 'node-libcurl/dist/curly';
import * as querystring from 'querystring';
import { LogFactory } from '../factory/log-factory';

export class ApiRequestUtil {
  // logger
  private static readonly logger = LogFactory.getLogger('api-requester');

  public static async getRequest(url: string, params?: {}, header?: string[]): Promise<any> {
    const {
      statusCode,
      data,
      headers,
    } = await curly.get(this.generateParams(url, params), this.generateOptions(false, undefined, header));
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

  public static async deleteRequest(url: string, params?: {}, header?: string[]): Promise<any> {
    const {
      statusCode,
      data,
      headers,
    } = await curly.delete(this.generateParams(url, params), this.generateOptions(false, undefined, header));
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

  private static generateParams(url: string, params: any) {
    if (!params) {
      return url;
    }
    let finUrl = url + '?';
    Object.entries(params).forEach(element => {
      const [key, value] = element;
      finUrl += `${key}=${value}&`;
    });
    console.log(finUrl.substring(0, finUrl.length - 1));
    return finUrl.substring(0, finUrl.length - 1);
  }

  public static analRs(url: string, params: {} | undefined, header: string[] | undefined, code: number, data: any, rsHeader: HeaderInfo[]) {
    switch (code) {
      case 200: // success
        return data;
      case 201: // created
        return code;
      case 204:
        this.logger.error('Operation Not Effected May Resource Already Exist');
        return code;
      case 404:
        throw new Error(`Request Got Response Code 404 Target: ${url}`);
      case 503:
        throw new Error(`Manager Server Health Check Error 503 Target: ${url}`);
      default:
        this.logger.error(`Request ${url} with param:${JSON.stringify(params)} Got Error Code: ${code}`);
        return {
          url,
          params,
          header,
          code,
          data,
          rsHeader,
        };
    }
  }

}
