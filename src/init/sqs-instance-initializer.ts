import AWS from 'aws-sdk';
import { PublicConfigLoader } from '../config/public-config-loader';
import { LogFactory } from '../factory/log-factory';
import { QueueEnum } from '../model/queue-enum';
import { DateUtil } from '../util/date-util';

/**
 * Amazon SQS queue config loader
 *
 * @since 1.0.0
 * @Date 2021-05-26
 * @author Luminous(BGLuminous)
 */
export default class SqsInstanceInitializer {
  // logger
  private static logger = LogFactory.getLogger('sqs-config-loader');
  // current sqs queue instance
  private readonly queue: AWS.SQS;

  /**
   * Constructor
   *
   * @param specificMode use specific mode to load public config, if you use multi queue at one project set it true
   *                     and set corresponding queue config
   * @param customConfig add custom amazon qsq config this config should include public config etc. apiVersion,
   *                     accessKeyId... it will overwrite public config at env, if want instance multi same type queue
   *                     you can ignored it
   */
  constructor(specificMode = false, customConfig?: AWS.SQS.ClientConfiguration) {
    SqsInstanceInitializer.logger.info(`Creating Amazon SQS queue at:${DateUtil.getTimestamp()}`);
    const basicConfig = PublicConfigLoader.getNecessaryConfig('', specificMode ? QueueEnum.SQS : undefined);
    if (customConfig) {
      this.queue = new AWS.SQS(PublicConfigLoader.mergeConfig(basicConfig, customConfig));
      return;
    }
    this.queue = new AWS.SQS(basicConfig);
  }

  /**
   * Get amazon sqs instance
   */
  public getSqs(): AWS.SQS {
    return this.queue;
  }
}
