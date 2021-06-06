import { curly, HeaderInfo } from 'node-libcurl';
import { CurlyOptions } from 'node-libcurl/dist/curly';
import * as querystring from 'querystring';
import { ApiResponseUtilInterface } from '../interface/api-response-util-interface';

export class ApiRequestUtil {

  private readonly responseAnalyzer: ApiResponseUtilInterface;

  constructor(responseAnalyzer: ApiResponseUtilInterface) {
    this.responseAnalyzer = responseAnalyzer;
  }

  public async getRequest(url: string, params?: {}, header?: string[]): Promise<any> {
    const { statusCode, data, headers }
        = await curly.get(this.createParams(url, params), ApiRequestUtil.createBody(false, undefined, header));
    return await this.responseAnalyzer.analGet(url, params, header, statusCode, data, headers);
  }

  public async postRequest(url: string, jsonStringify?: boolean, params?: {}, header?: string[])
      : Promise<any> {
    const { statusCode, data, headers }
        = await curly.post(url, ApiRequestUtil.createBody(jsonStringify, params, header));
    return await this.responseAnalyzer.analPost(url, params, header, statusCode, data, headers);
  }


  public async putRequest(url: string, jsonStringify?: boolean, params?: {}, header?: string[])
      : Promise<any> {
    const { statusCode, data, headers }
        = await curly.put(url, ApiRequestUtil.createBody(jsonStringify, params, header));
    return await this.responseAnalyzer.analPut(url, params, header, statusCode, data, headers);
  }

  public async deleteRequest(url: string, params?: {}, header?: string[]): Promise<any> {
    const { statusCode, data, headers }
        = await curly.delete(this.createParams(url, params), ApiRequestUtil.createBody(false, undefined, header));
    return this.responseAnalyzer.analDelete(url, params, header, statusCode, data, headers);
  }

  private static createBody(jsonStringify: boolean | undefined, params?: {}, header?: string[])
      : CurlyOptions {
    const options: CurlyOptions = {};
    if (params) {
      options.postFields = jsonStringify ? JSON.stringify(params) : querystring.stringify(params);
    }
    if (header) {
      options.httpHeader = header;
    }
    return options;
  }

  private createParams(url: string, params: any) {
    if (!params) {
      return url;
    }
    let finUrl = url + '?';
    Object.entries(params).forEach(element => {
      const [key, value] = element;
      finUrl += `${key}=${value}&`;
    });
    return finUrl.substring(0, finUrl.length - 1);
  }

}

export type Analyzer = (
    url: string,
    params: {} | undefined,
    header: string[] | undefined,
    code: number,
    data: any,
    rsHeader: HeaderInfo[],
) => Promise<any>;
