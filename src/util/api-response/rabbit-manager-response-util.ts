import { Logger } from 'log4js';
import { ApiResponseUtilInterface } from '../../interface/api-response-util-interface';

export class RabbitManagerResponseUtil implements ApiResponseUtilInterface {
  // logger
  private readonly logger: Logger;
  // print verbose log
  private readonly verbose: boolean = !!process.env.VERBOSE;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  analDelete(url: string, params: {} | undefined, headers: any, code: number, data: any, rsHeader: any): any {
    if (this.verbose) {
      this.printVerbose(url, params, headers, code, data, rsHeader);
    }
    // anal
    switch (code) {
      case 200:
        // deleted
        return true;
      case 204:
        // already deleted
        return true;
      default:
        this.logger.warn(`un-caught response code: ${ code } from ${ url }`);
        return {
          code: code,
          header: rsHeader,
          data: data,
        };
    }
  }

  public analGet(url: string, params: {} | undefined, headers: any, code: number, data: any, rsHeader: any): any {
    if (this.verbose) {
      this.printVerbose(url, params, headers, code, data, rsHeader);
    }
    // anal
    switch (code) {
      case 200:
        return data;
      case 404:
        this.logger.warn(`Cant Found Target Resource ${ url }`);
        return false;
      default:
        this.logger.warn(`Un-Caught response code: ${ code } from ${ url }`);
        return {
          code: code,
          header: rsHeader,
          data: data,
        };
    }
  }

  analPost(url: string, params: {} | undefined, headers: any, code: number, data: any, rsHeader: any): any {
    if (this.verbose) {
      this.printVerbose(url, params, headers, code, data, rsHeader);
    }
    return Promise.resolve(undefined);
  }

  analPut(url: string, params: {} | undefined, headers: any, code: number, data: any, rsHeader: any): any {
    if (this.verbose) {
      this.printVerbose(url, params, headers, code, data, rsHeader);
    }
    //anal
    switch (code) {
      case 201:
        // create operation will return this so return create success
        return true;
      case 204:
        // already exist only create operation will return this so return create failure
        return false;
      default:
        this.logger.warn(`un-caught response code: ${ code } from ${ url }`);
        return {
          code: code,
          header: rsHeader,
          data: data,
        };
    }
  }

  private printVerbose(url: string, params: {} | undefined, headers: any, code: number, data: any, rsHeader: any) {
    this.logger.info(
      `Requested Url: ${ url }
        headers: ${ JSON.stringify(headers) || '' }
        Params: ${ params || '' }
        Response Code: ${ code }
        Header: ${ rsHeader ? JSON.stringify(rsHeader) : '' }
        data: ${ data ? JSON.stringify(data) : '' }`);
  }


}
