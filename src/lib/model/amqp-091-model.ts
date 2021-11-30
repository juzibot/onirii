export namespace Amqp091Model {

  export interface BaseInfo {
    name: string,
    index: number,
    doc: string,
  }

  export interface Classes extends BaseInfo {
    method: Method[],
  }

  export interface Method extends BaseInfo {
    field: Field[],
  }

  export interface Field {
    name: string,
    domain: Domain,
    doc: string,
    size: number,
  }

  export interface Domain {
    type: DomainType,
    doc: string
  }

  export type DomainType =
    'bit'
    | 'octet'
    | 'short'
    | 'long'
    | 'longlong'
    | 'shortstr'
    | 'longstr'
    | 'timestamp'
    | 'table';

  export interface BufferWrapper {
    buf: Buffer,
    offset: number,
  }

}
