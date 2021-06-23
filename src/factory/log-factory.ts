import log4js = require('log4js');
import * as env from 'dotenv';
import * as fs from 'fs';
import { Logger } from 'log4js';

// load env config
env.config();

/**
 * Log factory for create log instance
 *
 * @since 1.0.0
 * @date 2021-06-01
 * @author Luminous(BGLuminous)
 */
export class LogFactory {
  // log path
  protected static currentPath = process.env.LOG_PATH ? process.env.LOG_PATH : './';
  // current config
  protected static config = {
    appenders: {
      console: { type: 'console', layout: { type: 'colored' } },
      default: {
        type: 'dateFile',
        filename: `${ LogFactory.currentPath }/onirii.log`,
        pattern: '.yyyy-MM-dd',
        keepFileExt: true,
        encoding: 'UTF-8',
      },
    },
    categories: {
      default: {
        appenders: [`default`, 'console'],
        level: 'debug',
      },
    },
  };
  // log dir ready?
  private static dirReady = false;

  /**
   * Re-flash log4js configure and create new logger instance (this key config already exist only creat logger instace)
   *
   * @param {string} key new logger key
   * @return {Logger} logger instance
   */
  public static create(key: string): Logger {
    // check log dir
    if (!this.dirReady) {
      if (!fs.existsSync(this.currentPath)) {
        fs.mkdirSync(this.currentPath);
      }
      this.dirReady = true;
    }
    // check if exist return logger instance
    if (Object.keys(this.config.appenders).includes(key, 0)) {
      return log4js.getLogger(key);
    }
    // add new config
    this.config.appenders = Object.assign(this.config.appenders, LogFactory.generateAppender(key));
    this.config.categories = Object.assign(this.config.categories, LogFactory.generateCategories(key));
    log4js.configure(this.config);
    return log4js.getLogger(key);
  }

  /**
   * Generate new appender config
   *
   * @param {string} key new logger key
   * @return {{[p: string]: {filename: string, keepFileExt: boolean, pattern: string, type: string, encoding: string}}}
   * @private
   */
  private static generateAppender(key: string) {
    return {
      [key]: {
        type: 'dateFile',
        filename: `${ this.currentPath }/onirii-${ key }.log`,
        pattern: '.yyyy-MM-dd',
        keepFileExt: true,
        encoding: 'UTF-8',
      },
    };
  }

  /**
   * Generate new categories config
   *
   * @param {string} key new logger key
   * @return {{[p: string]: {level: string, appenders: string[]}}}
   * @private
   */
  private static generateCategories(key: string) {
    return {
      [key]: {
        appenders: [`${ key }`, 'console'],
        level: 'debug',
      },
    };
  }

}
