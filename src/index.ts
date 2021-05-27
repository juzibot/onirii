import { LogFactory } from './factory/log-factory';

export class App {
  public test(): void {
    const logger = LogFactory.getLogger('sqs');
    logger.info('debug');
    logger.debug('debug');
    logger.warn('debug');
    logger.error('debug');
    logger.fatal('debug');
  }
}

new App().test();
