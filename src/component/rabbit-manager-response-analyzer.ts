import { Logger } from 'log4js';
import { HeaderInfo } from 'node-libcurl';
import { ResponseAnalysisInterface } from '../interface/api/response-analysis-interface';

/**
 * Rabbit
 *
 */
export class RabbitManagerResponseAnalyzer implements ResponseAnalysisInterface {
  // logger
  private readonly logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  analDelete(
      url: string,
      params: {} | undefined,
      header: string[] | undefined,
      code: number,
      data: any,
      rsHeader: HeaderInfo[],
  ): Promise<any> {
    return Promise.resolve(undefined);
  }

  analGet(
      url: string,
      params: {} | undefined,
      header: string[] | undefined,
      code: number,
      data: any,
      rsHeader: HeaderInfo[],
  ): Promise<any> {
    return Promise.resolve(undefined);
  }

  analPost(
      url: string,
      params: {} | undefined,
      header: string[] | undefined,
      code: number,
      data: any,
      rsHeader: HeaderInfo[],
  ): Promise<any> {
    return Promise.resolve(undefined);
  }

  analPut(
      url: string,
      params: {} | undefined,
      header: string[] | undefined,
      code: number,
      data: any,
      rsHeader: HeaderInfo[],
  ): Promise<any> {
    return Promise.resolve(undefined);
  }

}
