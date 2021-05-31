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
   * @param name current instance name (this name will inject to log config)
   * @param queueType supported queue type
   * @see #QueueEnum
   * @return PublicConfigModel public config data
   */
  public static getNecessaryConfig(name: string, queueType?: QueueEnum): PublicConfigModel {
    // load config from env
    const publicConfig: PublicConfigModel = {
      apiVersion: queueType ? process.env[`${queueType}_API_VERSION`] : process.env.API_VERSION,
      region: queueType ? process.env[`${queueType}_REGION`] : process.env.REGION,
      accessKeyId: queueType ? process.env[`${queueType}_ACCESS_KEY`] : process.env.ACCESS_KEY,
      secretAccessKey: queueType ? process.env[`${queueType}_SECRET_ACCESS_KEY`] : process.env.SECRET_ACCESS_KEY,
      amqpUrl: queueType ? process.env[`${queueType}_AMQP_URL`] : process.env.AMQP_URL,
      managerUrl: queueType ? process.env[`${queueType}_API_URL`] : process.env.API_URL,
      apiAuth: queueType ? process.env[`${queueType}_API_AUTH`] : process.env.API_AUTH,
    };
    this.logger.debug(`Loaded ${name}-${queueType} Public Config From ENV: ${JSON.stringify(publicConfig)}`);
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
