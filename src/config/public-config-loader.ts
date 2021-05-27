import AWS from 'aws-sdk';
import { LogFactory } from '../factory/log-factory';
import { PublicConfigModel } from '../model/public-config-model';
import { QueueEnum } from '../model/queue-enum';

/**
 * Queue public config loader util
 *
 * @since 1.0.0
 * @date 2021-05-26
 * @author Luminous(BGLuminous)
 */
export class PublicConfigLoader {
  // logger
  private static logger = LogFactory.getLogger('public-config-loader');

  /**
   * Get queue public necessary config from env, if specific queueType get current env
   *
   * @param queueType supported queue typeå
   * @see #QueueEnum
   * @return PublicConfigModel public config data
   */
  public static getNecessaryConfig(queueType?: QueueEnum): PublicConfigModel {
    const publicConfig = {
      apiVersion: queueType ? process.env[`${queueType}_API_VERSION`] : process.env.API_VERSION,
      region: queueType ? process.env[`${queueType}_REGION`] : process.env.REGION,
      accessKeyId: queueType ? process.env[`${queueType}_ACCESS_KEY`] : process.env.ACCESS_KEY,
      secretAccessKey: queueType ? process.env[`${queueType}_SECRET_ACCESS_KEY`] : process.env.SECRET_ACCESS_KEY,
    };
    this.logger.debug(`Loaded Public Config From ENV: ${JSON.stringify(publicConfig)}`);
    return publicConfig;
  }

  /**
   * Merge public config and customConfig, if custom config include same key overwrite it
   *
   * @param basicConfig public config
   * @param customConfig custom config
   * @see CustomConfig
   */
  public static mergeConfig(basicConfig: PublicConfigModel, customConfig: CustomConfig): CustomConfig {
    if (customConfig.apiVersion || customConfig.accessKeyId || customConfig.secretAccessKey || customConfig.region) {
      this.logger.warn('You Should Not Overwrite Public Config At customConfig');
      Object.keys(customConfig).forEach(key => {
        if (key === 'apiVersion' || key === 'accessKeyId' || key === 'secretAccessKey' || key === 'region') {
          this.logger.warn(`Overwriting public config ${key}`);
        }
      });
    }
    return Object.assign(basicConfig, customConfig);
  }
}

// Merge-ability queue type
export type CustomConfig = AWS.SQS.ClientConfiguration;
