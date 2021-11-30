import { Amqp091Model } from '../model/amqp-091-model';

export namespace Amqp091Definitions {

  export const PROTOCOL: string = 'AMQP' + String.fromCharCode(0, 0, 9, 1);

  export const BASE_OFFSET = 11;

  export enum FrameType {
    METHOD = 1,
    HEADER = 2,
    BODY = 3,
    HEARTBEAT = 4
  }

  export enum DataType {
    STRING = 83,
    INTEGER = 73,
    HASH = 70,
    TIME = 84,
    DECIMAL = 68,
    BOOLEAN = 116,
    SIGNED_8BIT = 98,
    SIGNED_16BIT = 115,
    SIGNED_64BIT = 108,
    _32BIT_FLOAT = 102,
    _64BIT_FLOAT = 100,
    VOID = 86,
    BYTE_ARRAY = 120,
    ARRAY = 65,
    TEN = 49,
    BOOLEAN_TRUE = '\x01',
    BOOLEAN_FALSE = '\x00',
  }

  /**
   * Field Type
   * see amqp0-9-1.pdf 4.2.1 Formal Protocol Grammar
   */
  export enum FieldValueType {
    BOOLEAN = 't',
    SHORT_SHORT_INT = 'b',
    SHORT_SHORT_UINT = 'B',
    SHORT_INT = 'U',
    SHORT_UINT = 'u',
    LONG_INT = 'I',
    LONG_UINT = 'i',
    LONG_LONG_INT = 'L',
    LONG_LONG_UINT = 'l',
    FLOAT = 'f',
    DOUBLE = 'd',
    DECIMAL_VALUE = 'D',
    SHORT_STRING = 's',
    LONG_STRING = 'S',
    FIELD_ARRAY = 'A',
    TIMESTAMP = 'T',
    FIELD_TABLE = 'F',
    NO_FIELD = 'V',
    BUFFER = 'x',
  }

  /**
   * Elementary domains
   */
  export namespace Domain {

    export const Bit: Amqp091Model.Domain = {
      type: 'bit',
      doc: 'single bit',
    };

    export const Octet: Amqp091Model.Domain = {
      type: 'octet',
      doc: 'single octet',
    };

    export const Short: Amqp091Model.Domain = {
      type: 'short',
      doc: '16-bit integer',
    };

    export const Long: Amqp091Model.Domain = {
      type: 'long',
      doc: '32-bit integer',
    };

    export const LongLong: Amqp091Model.Domain = {
      type: 'longlong',
      doc: '64-bit integer',
    };

    export const ShortStr: Amqp091Model.Domain = {
      type: 'shortstr',
      doc: 'short string (max. 256 characters)',
    };

    export const LongStr: Amqp091Model.Domain = {
      type: 'longstr',
      doc: 'long string',
    };

    export const Timestamp: Amqp091Model.Domain = {
      type: 'timestamp',
      doc: '64-bit timestamp',
    };

    export const Table: Amqp091Model.Domain = {
      type: 'table',
      doc: 'field table',
    };

  }

  export namespace Method {

    export const start: Amqp091Model.Method = {
      name: 'start',
      index: 10,
      doc: 'start connection negotiation',
      field: [
        {
          name: 'version-major',
          domain: Domain.Octet,
          doc: 'protocol major version',
          size: 1
        },
        {
          name: 'version-minor',
          domain: Domain.Octet,
          doc: 'protocol minor version',
          size: 1
        },
        {
          name: 'server-properties',
          domain: Domain.Table,
          doc: 'server properties',
          size: 0
        },
        {
          name: 'mechanisms',
          domain: Domain.LongStr,
          doc: 'available security mechanisms',
          size: 4
        },
        {
          name: 'locales',
          domain: Domain.LongStr,
          doc: 'available message locales',
          size: 4
        },
      ],
    };

    export const StartOk: Amqp091Model.Method = {
      name: 'start-ok',
      index: 11,
      doc: 'select security mechanism and locale',
      field: [
        {
          name: 'client-properties',
          domain: Domain.Table,
          doc: 'client properties',
          size: 0
        },
        {
          name: 'mechanism',
          domain: Domain.ShortStr,
          doc: 'selected security mechanism',
          size: 1
        },
        {
          name: 'response',
          domain: Domain.LongStr,
          doc: 'security response data',
          size: 4
        },
        {
          name: 'locale',
          domain: Domain.ShortStr,
          doc: 'selected message locale',
          size: 1
        },
      ],
    };
  }

  export namespace Classes {

    export const connection: Amqp091Model.Classes = {
      name: 'connection',
      index: 10,
      doc: 'work with socket connections',
      method: [Method.start, Method.StartOk],
    };

  }

  export const classes: Amqp091Model.Classes[] = [Classes.connection];
}
