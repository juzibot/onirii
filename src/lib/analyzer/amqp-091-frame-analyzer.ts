export class Amqp091FrameAnalyzer {

  public static analyzer(buffer: Buffer): void {
    console.log('type:' + buffer.indexOf(0).toString(16));
    console.log('channel:' + buffer.slice(1, 3).toString('hex'));
    console.log('size:' + parseInt(buffer.slice(3, 7).toString('hex'), 16));
    console.log('classes id:' + parseInt(buffer.slice(7, 9).toString('hex'), 16));
    console.log('method id:' + parseInt(buffer.slice(9, 11).toString('hex'), 16));
  }

}
