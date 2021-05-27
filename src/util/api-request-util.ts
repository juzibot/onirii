import axios from 'axios';
import { LogFactory } from '../factory/log-factory';

export class ApiRequestUtil {
//logger
  private static readonly logger = LogFactory.getLogger('api-requester');

  public static getRequest() {

  }

  public static postRequest() {

  }


  public static async putRequest(url: string, params?: {}): Promise<Promise<{}> | undefined> {
    const res = await axios.put(url, params).catch(err => {
      this.logger.error(err.toString());
      throw err;
    });
    if (res.status === 200) {
      return res.data;
    }
    return undefined;
  }

  public static async deleteRequest(url: string, params: {}) {
    const res = await axios.delete(url, params).catch(err => {
      this.logger.error(err.toString());
      throw err;
    });
    if (res.status === 200) {
      return res.data;
    }
    return undefined;
  }

}