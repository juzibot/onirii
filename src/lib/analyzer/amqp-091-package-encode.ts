import { Amqp091Definitions } from '../definitions/amqp-091-definitions';
import { BufferMoreInt } from '../extra/buffer-more-int';
import { Amqp091Model } from '../model/amqp-091-model';

export class Amqp091PackageEncode {

  public static encodeArray(buffer: Amqp091Model.BufferWrapper, data: Array<any>): void {
    const start: number = buffer.offset;
    buffer.offset += 4;
    for (const element of data) {
      this.encodeField(buffer, element);
    }
    buffer.buf.writeUInt32BE(buffer.offset - start - 4, start);
  }

  public static encodeTable(buffer: Amqp091Model.BufferWrapper, table: Record<any, any>): void {
    const start: number = buffer.offset;
    // retain table length position
    buffer.offset += 4;
    // inject table data
    for (const tableKey in table) {
      if (!!tableKey) {
        const length = Buffer.byteLength(tableKey);
        // write length and add position
        buffer.buf.writeUInt8(length, buffer.offset++);
        // write key
        buffer.buf.write(tableKey, buffer.offset, 'utf-8');
        buffer.offset += length;
        // write value
        this.encodeField(buffer, table[tableKey]);
      }
    }
    // write size
    buffer.buf.writeUInt32BE(buffer.offset - start - 4, start);
  }

  public static encodeField(buffer: Amqp091Model.BufferWrapper, data: any): void {
    let valueType: string = typeof data;
    let tempValue: any = data;

    // A trapdoor for specifying a type, e.g., timestamp
    if (tempValue && valueType === 'object' && tempValue.hasOwnProperty('!')) {
      tempValue = tempValue.value;
      valueType = tempValue['!'];
    }

    // recheck number detail type
    if (valueType === 'number') {
      valueType = this.recheckNumberType(tempValue);
    }

    // encode field
    switch (valueType) {
      case 'boolean':
        this.encodeTag(buffer, Amqp091Definitions.FieldValueType.BOOLEAN);
        buffer.buf.writeUInt8(tempValue ? 1 : 0, buffer.offset++);
        break;
      case 'byte':
      case 'int8':
        this.encodeTag(buffer, Amqp091Definitions.FieldValueType.SHORT_SHORT_INT);
        buffer.buf.writeInt8(tempValue, buffer.offset++);
        break;
      case 'short':
      case 'int16':
        this.encodeTag(buffer, Amqp091Definitions.FieldValueType.SHORT_STRING);
        buffer.buf.writeInt16BE(tempValue, buffer.offset);
        buffer.offset += 2;
        break;
      case 'int':
      case 'int32':
        this.encodeTag(buffer, Amqp091Definitions.FieldValueType.LONG_INT);
        buffer.buf.writeInt32LE(tempValue, buffer.offset);
        buffer.offset += 4;
        break;
      case 'float':
        this.encodeTag(buffer, Amqp091Definitions.FieldValueType.FLOAT);
        buffer.buf.writeFloatBE(tempValue, buffer.offset);
        buffer.offset += 4;
        break;
      case 'decimal':
        this.encodeTag(buffer, Amqp091Definitions.FieldValueType.DECIMAL_VALUE);
        if (tempValue.hasOwnProperty('places') && tempValue.hasOwnProperty('digits') && tempValue.places >= 0 && tempValue.places < 256) {
          buffer.buf[buffer.offset++] = tempValue.places;
          buffer.buf.writeUInt32BE(tempValue.digits, buffer.offset);
          buffer.offset += 4;
          break;
        }
        throw new TypeError('Decimal value must be {\'places\': 0..255, \'digits\': uint32}');
      case 'double':
      case 'float64':
        this.encodeTag(buffer, Amqp091Definitions.FieldValueType.DOUBLE);
        buffer.buf.writeDoubleBE(tempValue, buffer.offset);
        buffer.offset += 8;
        break;
      case 'long':
      case 'int64':
        this.encodeTag(buffer, Amqp091Definitions.FieldValueType.LONG_LONG_UINT);
        BufferMoreInt.writeInt64BE(buffer.buf, tempValue, buffer.offset);
        buffer.offset += 8;
        break;
      // Now for exotic types, those can _only_ be denoted by using
      // `{'!': type, value: val}
      case 'timestamp':
        this.encodeTag(buffer, Amqp091Definitions.FieldValueType.TIMESTAMP);
        BufferMoreInt.writeUInt64BE(buffer.buf, tempValue, buffer.offset);
        buffer.offset += 8;
        break;
      case 'string':
        const length = Buffer.byteLength(tempValue, 'utf-8');
        this.encodeTag(buffer, Amqp091Definitions.FieldValueType.LONG_STRING);
        buffer.buf.writeUInt32BE(length, buffer.offset);
        buffer.offset += 4;
        buffer.buf.write(tempValue, buffer.offset, 'utf-8');
        buffer.offset += length;
        break;
      case 'object':
        if (tempValue === null) {
          this.encodeTag(buffer, Amqp091Definitions.FieldValueType.NO_FIELD);
        } else if (Array.isArray(tempValue)) {
          this.encodeTag(buffer, Amqp091Definitions.FieldValueType.FIELD_ARRAY);
          this.encodeArray(buffer, tempValue);
        } else if (Buffer.isBuffer(tempValue)) {
          this.encodeTag(buffer, Amqp091Definitions.FieldValueType.BUFFER);
          buffer.buf.writeUInt32BE(tempValue.length, buffer.offset);
          buffer.offset += 4;
          tempValue.copy(buffer.buf, buffer.offset);
          buffer.offset += tempValue.length;
        } else {
          this.encodeTag(buffer, Amqp091Definitions.FieldValueType.FIELD_TABLE);
          this.encodeTable(buffer, tempValue);
        }
        break;
      default:
        throw new Error('Unknown type to encode: ' + valueType);
    }

  }

  private static recheckNumberType(value: number): string {
    if (this.isFloatingPoint(value)) {
      return 'double';
    }
    if (value < 128 && value >= -128) {
      return 'byte';
    } else if (value >= -0x8000 && value < 0x8000) {
      return 'short';
    } else if (value >= -0x80000000 && value < 0x80000000) {
      return 'int';
    } else {
      return 'long';
    }
  }

  /**
   *  JavaScript uses only doubles so what I'm testing for is whether
   *  it's *better* to encode a number as a float or double. This really
   *  just amounts to testing whether there's a fractional part to the
   *  number, except that see below. NB I don't use bitwise operations to
   *  do this 'efficiently' -- it would mask the number to 32 bits.
   *
   *  At 2^50, doubles don't have sufficient precision to distinguish
   *  between floating point and integer numbers (`Math.pow(2, 50) + 0.1
   *  === Math.pow(2, 50)` (and, above 2^53, doubles cannot represent all
   *  integers (`Math.pow(2, 53) + 1 === Math.pow(2, 53)`)). Hence
   *  anything with a magnitude at or above 2^50 may as well be encoded
   *  as a 64-bit integer. Except that only signed integers are supported
   *  by RabbitMQ, so anything above 2^63 - 1 must be a double.
   * @param num
   * @private
   */
  public static isFloatingPoint(num: number): boolean {
    return num >= 0x8000000000000000 || Math.abs(num) < 0x4000000000000 && Math.floor(num) !== num;
  }


  public static encodeTag(buffer: Amqp091Model.BufferWrapper, tag: Amqp091Definitions.FieldValueType): void {
    buffer.buf.write(tag, buffer.offset++);
  }


}
