import { Amqp091ConnectionClasses } from '../realize/amqp-091-connection-classes';

export class Amqp091FrameAnalyzer {

  public static analyzer(buffer: Buffer): void {
    const type = buffer.indexOf(0).toString(16);
    const channel = buffer.slice(1, 3).toString('hex');
    const packageSize = parseInt(buffer.slice(3, 7).toString('hex'), 16);
    const classesId = parseInt(buffer.slice(7, 9).toString('hex'), 16);
    const methodId = parseInt(buffer.slice(9, 11).toString('hex'), 16);
    console.log('type:%s channel:%s size:%s classes id:%s method id:%s', type, channel, packageSize, classesId, methodId);
    this.realizeClasses(classesId, methodId, buffer);
  }


  private static realizeClasses(classesId: number, methodId: number, buffer: Buffer) {
    switch (classesId) {
      case 10:
        Amqp091ConnectionClasses.realize(methodId, buffer);
        break;
      default:
        new Error('Unknown classes id: ' + classesId);
    }
  }
}
