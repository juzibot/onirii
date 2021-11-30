import { Amqp091Definitions } from '../definitions/amqp-091-definitions';
import { Amqp091Model } from '../model/amqp-091-model';
import FrameType = Amqp091Definitions.FrameType;

export class Amqp091PublicUtil {

  public static getEmptyBufferWrapper(): Amqp091Model.BufferWrapper {
    return {
      buf: Buffer.alloc(65536),
      offset: 0,
    };
  }

  public static getBaseBuffer(
    frameType: FrameType, channel: number, classes: number, method: number, size: number,
  ): Buffer {
    const buffer: Buffer = Buffer.alloc(size);
    // frame type (1 block)
    buffer[0] = frameType;
    // channel (2 block)
    buffer.writeUInt16BE(channel, 1);
    //write size (4 block)
    buffer.writeUInt32BE(size - 8, 3);
    // classes and method (4 + 4 block)
    buffer.writeUInt16BE(classes, 7);
    buffer.writeUInt16BE(method, 9);
    // offset to 11 now
    buffer[size - 1] = 206;
    return buffer;
  }

}
