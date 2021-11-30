export class PublicConstance {

  public static readonly RUNTIME: boolean = typeof window !== 'undefined';

  public static readonly CLIENT_PROPERTIES: Record<any, any> = {
    'product': 'onirii',
    'version': '2.0.0',
    'platform': this.RUNTIME ? 'Node.JS ' + process.version : 'Browser',
    'information': 'https://gitlab.heavenark.com/Luminous/onirii',
    'capabilities': {
      // 'publisher_confirms': true,
      'exchange_exchange_bindings': true,
      'basic.nack': true,
      'consumer_cancel_notify': true,
      'connection.blocked': true,
      'authentication_failure_close': true,
    },
  };

}
