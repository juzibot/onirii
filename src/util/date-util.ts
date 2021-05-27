export class DateUtil {
  public static getTimestamp(): number {
    return new Date().valueOf();
  }

  public static compareTimestamp(): boolean {
    return true;
  }

  public static compareWithNow(): string {
    return `string`;
  }
}

export enum TimeUnit {
  MILLISECOND = 1,
  SECOND = 1000,
  MINUTE = 60 * SECOND,
  HOUR = 1000 * MINUTE,
  DAY = 24 * HOUR,
}
