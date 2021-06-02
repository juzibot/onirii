import * as env from 'dotenv';
import { PublicConfigModel } from '../model/public-config-model';

/**
 * Load Config From Environment
 *
 * @since 1.0.0
 * @date 2021-06-01
 * @author Luminous(BGLuminous)
 */
export class EnvLoaderUtil {
  // instance
  private static INSTANCE: EnvLoaderUtil;
  // public config
  private readonly config: PublicConfigModel;

  /**
   * Constructor
   *
   * @private single instance mode
   */
  private constructor() {
    env.config();
    this.config = {
      amqpServerUrl: process.env.AMQP_SERVER_URL,
      managerApiUrl: process.env.MANAGER_API_URL,
      managerAuth: process.env.MANAGER_AUTH,
      maxChannelCount: Number(process.env.MAX_CHANNEL_COUNT),
    };
  }

  /**
   * Get current instance
   *
   * @return {EnvLoaderUtil}
   * @constructor
   */
  public static getInstance(): EnvLoaderUtil {
    if (!this.INSTANCE) {
      this.INSTANCE = new EnvLoaderUtil();
    }
    return this.INSTANCE;
  }

  /**
   * Get public config
   *
   * @return {PublicConfigModel}
   */
  public getPublicConfig(): PublicConfigModel {
    return this.config;
  }
}
