import axios, { AxiosRequestConfig } from 'axios';
import { ApiResponseUtilInterface } from '../interface/api-response-util-interface';

export class ApiRequestUtil {

  private readonly responseAnalyzer: ApiResponseUtilInterface;

  constructor(responseAnalyzer: ApiResponseUtilInterface, auth: any) {
    this.responseAnalyzer = responseAnalyzer;
    axios.defaults.headers = auth;
  }

  private static createBody(data?: any, headers?: any): AxiosRequestConfig {
    const options: AxiosRequestConfig = {};
    if (data) {
      options.data = data;
    }
    if (headers) {
      options.headers = headers;
    }
    return options;
  }

  public async getRequest(url: string, params?: {}, headers?: any): Promise<any> {
    let requestRs: { status: number, data: any, headers: any };
    try {
      requestRs = await axios.get(this.createParams(url, params), ApiRequestUtil.createBody(undefined, headers));
    } catch (err) {
      requestRs = err.response;
    }
    return this.responseAnalyzer.analGet(url, params, headers, requestRs.status, requestRs.data, requestRs.headers);
  }

  public async postRequest(url: string, params?: {}, headers?: any): Promise<any> {
    let requestRs: { status: number, data: any, headers: any };
    try {
      requestRs = await axios.post(url, ApiRequestUtil.createBody(params, headers));
    } catch (err) {
      requestRs = err.response;
    }
    return this.responseAnalyzer.analPost(url, params, headers, requestRs.status, requestRs.data, requestRs.headers);
  }

  public async putRequest(url: string, params?: {}, headers?: any): Promise<any> {
    let requestRs: { status: number, data: any, headers: any };
    try {
      requestRs = await axios.put(url, ApiRequestUtil.createBody(params, headers));
    } catch (err) {
      requestRs = err.response;
    }
    return this.responseAnalyzer.analPut(url, params, headers, requestRs.status, requestRs.data, requestRs.headers);
  }

  public async deleteRequest(url: string, params?: {}, headers?: any): Promise<any> {
    let requestRs: { status: number, data: any, headers: any };
    try {
      requestRs = await axios.delete(this.createParams(url, params), ApiRequestUtil.createBody(undefined, headers));
    } catch (err) {
      requestRs = err.response;
    }
    return this.responseAnalyzer.analDelete(url, params, headers, requestRs.status, requestRs.data, requestRs.headers);
  }

  private createParams(url: string, params: any) {
    if (!params) {
      return url;
    }
    let finUrl = url + '?';
    Object.entries(params).forEach(element => {
      const [key, value] = element;
      finUrl += `${ key }=${ value }&`;
    });
    return finUrl.substring(0, finUrl.length - 1);
  }

}
