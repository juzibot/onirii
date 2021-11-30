import * as net from 'net';
import { Amqp091FrameAnalyzer } from '../src/lib/analyzer/amqp-091-frame-analyzer';
import { Amqp091PackageDecode } from '../src/lib/analyzer/amqp-091-package-decode';
import { Amqp091PackageEncode } from '../src/lib/analyzer/amqp-091-package-encode';
import { Amqp091Definitions } from '../src/lib/definitions/amqp-091-definitions';
import { Amqp091MethodModel } from '../src/lib/model/amqp-091-method-model';
import { Amqp091Model } from '../src/lib/model/amqp-091-model';
import { PublicConstance } from '../src/lib/public-constance';
import { Amqp091ConnectionClasses } from '../src/lib/realize/amqp-091-connection-classes';
import { Amqp091PublicUtil } from '../src/lib/util/amqp-091-public-util';
import FrameType = Amqp091Definitions.FrameType;

test('single-test', async () => {
  const sockOption = Object();
  const parts = new URL('amqp://test:testtset123+@106.13.64.53:8888'); // yes, parse the query string
  const protocol = parts.protocol;
  sockOption.host = parts.hostname;
  sockOption.servername = parts.hostname;
  sockOption.port = parseInt(parts.port) || (protocol === 'amqp:' ? 5672 : 5671);
  const connect = new net.Socket();
  connect
    .on('data', function(data: Buffer) {
      console.log(data.toString('hex'));
      Amqp091FrameAnalyzer.analyzer(data.slice(0, 11));
      console.log(data.slice(11).toString());
      const dataBuf = Buffer.alloc(data.length - 11);
      data.copy(dataBuf, 0, 11, data.length);
      console.log(Amqp091PackageDecode.decode(dataBuf, Amqp091Definitions.Method.start.field));

      const buffer: Amqp091Model.BufferWrapper = {
        buf: Buffer.alloc(16384),
        offset: 0,
      };
      Amqp091PackageEncode.encodeTable(buffer, { LOGIN: parts.username, PASSWORD: parts.password });

      const sendData: Amqp091MethodModel.Connection.StartOk = {
        clientProperties: PublicConstance.CLIENT_PROPERTIES,
        locale: 'en_US',
        mechanism: 'AMQPLAIN',
        response: buffer.buf.slice(4, buffer.offset),
      };

      connect.write(Amqp091ConnectionClasses.startOk(0, sendData));
    })
    .on('connect', () => {
      console.log('connect');
    })
    .on('error', (err: Error) => {
      console.log(err);
    })
    .on('ready', () => {
      console.log('ready');
    })
    .on('drain', () => {
      console.log('drain');
    })
    .on('close', (had_error: boolean) => {
      console.log('close', had_error);
    });

  connect.connect(sockOption);

  connect.write(Amqp091Definitions.PROTOCOL);

  await new Promise(resolve => setTimeout(resolve, 10 * 1000));
});

test('single', async () => {
  const pack: Buffer = Amqp091PublicUtil.getBaseBuffer(FrameType.METHOD, 0, 10, 11, 100);
  console.log(pack.toString('hex'));

  const buff = Buffer.alloc(20);
  // buff.writeUInt32BE(655371, 7);
  // buff.writeUInt32BE(0, 3);
  buff[0] = 206;
  console.log(buff.toString('hex'));
});

jest.setTimeout(1000 * 60 * 60);


