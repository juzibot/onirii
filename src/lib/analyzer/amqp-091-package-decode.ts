// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import jspack from 'jspack/jspack.js';
import { Amqp091Definitions } from '../definitions/amqp-091-definitions';
import { Amqp091Model } from '../model/amqp-091-model';

export class Amqp091PackageDecode {

  public static decode(buf: Buffer, fields: Amqp091Model.Field[]): any {
    const data: any = {};
    let bitIndex = 0;
    const bufWrapper: Amqp091Model.BufferWrapper = {
      buf: buf,
      offset: 0,
    };

    console.debug(
      `start decoding... data length: ${ buf.length } data: ${ buf.toString('hex') } fields data: ${ JSON.stringify(fields) }`,
    );

    for (let i = 0; i < fields.length; i++) {
      console.log(`Now Position: ${ bufWrapper.offset }`);
      switch (fields[i].domain.type) {
        case 'bit':
          data[fields[i].name] = this.decodeBit(bufWrapper, fields, i, bitIndex);
          break;
        case 'octet':
          data[fields[i].name] = this.decodeOctet(bufWrapper);
          break;
        case 'short':
          data[fields[i].name] = this.decodeInt(bufWrapper, 2);
          break;
        case 'long':
          data[fields[i].name] = this.decodeInt(bufWrapper, 4);
          break;
        case 'longlong':
          data[fields[i].name] = this.decodeLongLong(bufWrapper);
          break;
        case 'timestamp':
          data[fields[i].name] = this.decodeInt(bufWrapper, 8);
          break;
        case 'shortstr':
          data[fields[i].name] = this.decodeShortStr(bufWrapper);
          break;
        case 'longstr':
          data[fields[i].name] = this.decodeLongStr(bufWrapper);
          break;
        case 'table':
          data[fields[i].name] = this.decodeTable(bufWrapper);
          break;
        default:
          throw new Error(`Un-Supported Type Got: ${ fields[i].domain } buf: ${ buf }`);
      }
    }

    if (bufWrapper.offset !== bufWrapper.buf.length - 1) {
      console.warn(`Not All Buffer Decoded total: ${ bufWrapper.buf.length } current: ${ bufWrapper.offset }`);
    }

    return data;
  }

  private static decodeBit(bufWrapper: Amqp091Model.BufferWrapper, fields: Amqp091Model.Field[], position: number, bitIndex: number): any {
    const tempValue = !!(bufWrapper.buf[bufWrapper.offset] & 1 << bitIndex);

    if (!fields[position + 1] || fields[position + 1].domain.type !== 'bit') {
      bufWrapper.offset++;
    }

    console.debug(`Decoding Bit Result: ${ tempValue }`);
    return tempValue;
  }

  private static decodeOctet(bufWrapper: Amqp091Model.BufferWrapper) {
    const temp = bufWrapper.buf[bufWrapper.offset++];
    console.debug(`Decoding Octet Result: ${ temp }`);
    return temp;
  }

  private static decodeInt(bufWrapper: Amqp091Model.BufferWrapper, size: number): any {
    let tempValue: any;
    switch (size) {
      case 1:
        tempValue = bufWrapper.buf[bufWrapper.offset++];
        break;
      case 2:
        tempValue = (bufWrapper.buf[bufWrapper.offset++] << 8)
          + bufWrapper.buf[bufWrapper.offset++];
        break;
      case 4:
        tempValue = (bufWrapper.buf[bufWrapper.offset++] << 24)
          + (bufWrapper.buf[bufWrapper.offset++] << 16)
          + (bufWrapper.buf[bufWrapper.offset++] << 8)
          + bufWrapper.buf[bufWrapper.offset++];
        break;
      case 8:
        tempValue = (bufWrapper.buf[bufWrapper.offset++] << 24)
          + (bufWrapper.buf[bufWrapper.offset++] << 16)
          + (bufWrapper.buf[bufWrapper.offset++] << 8)
          + (bufWrapper.buf[bufWrapper.offset++] << 0)
          + (bufWrapper.buf[bufWrapper.offset++] << 24)
          + (bufWrapper.buf[bufWrapper.offset++] << 16)
          + (bufWrapper.buf[bufWrapper.offset++] << 8)
          + bufWrapper.buf[bufWrapper.offset++];
        break;
      default:
        throw new Error('cannot parse ints of that size');
    }
    console.debug(`Decoding Int size: ${ size } Result: ${ tempValue }`);
    return tempValue;
  }

  private static decodeLongLong(bufWrapper: Amqp091Model.BufferWrapper) {
    const tempBuf = new Buffer(8);
    for (let j = 0; j < 8; j++) {
      tempBuf[j] = bufWrapper.buf[bufWrapper.offset++];
    }
    console.debug(`Decoding LongLong  Result: ${ tempBuf }`);
    return tempBuf;
  }

  private static decodeShortStr(bufWrapper: Amqp091Model.BufferWrapper): string {
    const length = bufWrapper.buf[bufWrapper.offset++];
    const str = bufWrapper.buf.toString('utf8', bufWrapper.offset, bufWrapper.offset + length);
    bufWrapper.offset += length;
    console.log(`Decoding Short Str Result: ${ str }`);
    return str;
  }

  private static decodeLongStr(bufWrapper: Amqp091Model.BufferWrapper): string {
    const length = this.decodeInt(bufWrapper, 4);
    const buf = bufWrapper.buf.slice(bufWrapper.offset, bufWrapper.offset += length);
    console.log(`Decoding Long Str Result: ${ buf.toString() }`);
    return buf.toString();
  }

  private static decodeTable(bufWrapper: Amqp091Model.BufferWrapper) {
    const length = bufWrapper.offset + this.decodeInt(bufWrapper, 4);
    const table: any = {};

    while (bufWrapper.offset < length) {
      table[this.decodeShortStr(bufWrapper)] = this.decodeTableValue(bufWrapper);
    }

    console.log(`Decoding Table Result: ${ JSON.stringify(table) }`);
    return table;
  }

  private static decodeTableValue(bufWrapper: Amqp091Model.BufferWrapper): any {
    const dataType = bufWrapper.buf[bufWrapper.offset++];
    console.debug(`Now Position: ${ bufWrapper.offset } dataType: ${ dataType }`);
    switch (dataType) {
      case Amqp091Definitions.DataType.STRING:
        return this.decodeLongStr(bufWrapper);
      case Amqp091Definitions.DataType.INTEGER:
        return this.decodeInt(bufWrapper, 4);
      case Amqp091Definitions.DataType.HASH:
        return this.decodeTable(bufWrapper);
      case Amqp091Definitions.DataType.TIME:
        const int = this.decodeInt(bufWrapper, 8);
        return new Date().setTime(int * 1000);
      case Amqp091Definitions.DataType.DECIMAL:
        return this.decodeInt(bufWrapper, 4) / (this.decodeInt(bufWrapper, 1) * 10);
      case Amqp091Definitions.DataType.BOOLEAN:
        return this.decodeInt(bufWrapper, 1) > 0;
      case Amqp091Definitions.DataType.SIGNED_8BIT:
        return this.decodeInt(bufWrapper, 1);
      case Amqp091Definitions.DataType.SIGNED_16BIT:
        break;
      case Amqp091Definitions.DataType.SIGNED_64BIT:
        return this.decodeInt(bufWrapper, 8);
      case Amqp091Definitions.DataType._32BIT_FLOAT:
        const bit32Arr: any[] = [];
        for (let i = 0; i < 4; ++i)
          bit32Arr[i] = bufWrapper.buf[bufWrapper.offset++];
        return jspack.jspack.Unpack('f', bit32Arr);
      case Amqp091Definitions.DataType._64BIT_FLOAT:
        const b: any[] = [];
        for (let i = 0; i < 8; ++i)
          b[i] = bufWrapper.buf[bufWrapper.offset++];
        return jspack.jspack.Unpack('d', b);
      case Amqp091Definitions.DataType.VOID:
        return null;
      case Amqp091Definitions.DataType.BYTE_ARRAY:
        const byteArrLength = this.decodeInt(bufWrapper, 4);
        const buf = new Buffer(byteArrLength);
        bufWrapper.buf.copy(buf, 0, bufWrapper.offset, bufWrapper.offset + byteArrLength);
        bufWrapper.offset += byteArrLength;
        return buf;
      case Amqp091Definitions.DataType.ARRAY:
        const arrLength = this.decodeInt(bufWrapper, 4);
        const end = bufWrapper.offset + arrLength;
        const arr: any[] = [];
        while (bufWrapper.offset < end) {
          arr.push(this.decodeTableValue(bufWrapper));
        }
        return arr;
      case Amqp091Definitions.DataType.TEN:
        break;
      case Amqp091Definitions.DataType.BOOLEAN_TRUE:
        break;
      case Amqp091Definitions.DataType.BOOLEAN_FALSE:
        break;
      default:
        throw new Error(`Un-Supported Data Type :${ dataType }`);
    }
  }


}
