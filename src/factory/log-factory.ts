import log4js = require('log4js');
import * as env from 'dotenv';
import * as fs from 'fs';
import { Logger } from 'log4js';

env.config();

const currentPath = process.env.LOG_PATH ? process.env.LOG_PATH : './';

const config = {
  appenders: {
    console: { type: 'console', layout: { type: 'colored' } },
    total: {
      type: 'dateFile',
      filename: `${currentPath}/onirii.log`,
      pattern: '.yyyy-MM-dd',
      keepFileExt: true,
      encoding: 'UTF-8',
    },
  },
  categories: {
    default: {
      appenders: ['total', 'console'],
      level: 'debug',
    },
  },
};

/**
 * Log factory
 *
 * @
 */
export class LogFactory {
  public static getLogger(categories: string): Logger {
    if (!fs.existsSync(currentPath)) {
      fs.mkdirSync(currentPath);
    }
    log4js.configure(config);
    return log4js.getLogger(categories);
  }

  public static flush(newInstanceLog: string): Logger {
    config.appenders = Object.assign(config.appenders, LogFactory.generateAppenders(newInstanceLog));
    config.categories = Object.assign(config.categories, LogFactory.generateCategories(newInstanceLog));
    if (!Object.keys(config.appenders).includes(newInstanceLog, 0)) {
      log4js.configure(config);
    }
    return this.getLogger(newInstanceLog);
  }

  private static generateAppenders(newInstanceLog: string) {
    return {
      [newInstanceLog]: {
        type: 'dateFile',
        filename: `${currentPath}/onirii-${newInstanceLog}.log`,
        pattern: '.yyyy-MM-dd',
        keepFileExt: true,
        encoding: 'UTF-8',
      },
    };
  }

  private static generateCategories(newInstanceLog: string) {
    return {
      [newInstanceLog]: {
        appenders: [`${newInstanceLog}`, 'console'],
        level: 'debug',
      },
    };
  }
}
