export namespace Amqp091MethodModel {

  export namespace Connection {

    export interface Start {
      versionMajor: number,
      versionMinor: number,
      serverProperties: Record<any, any>,
      mechanisms: string,
      locales: string
    }

    export interface StartOk {
      clientProperties: Record<any, any>,
      mechanism: string,
      // TODO: this may cause exception, because in doc this type is [longstr]
      response: Buffer,
      locale: string
    }
  }

}
