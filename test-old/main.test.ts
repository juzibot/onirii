import { curly } from 'node-libcurl';
import { QueueEnum } from '../src/model/queue-enum';

test('temp test', async () => {

  const { statusCode, data, headers } = await curly.get('baidu.com');

  console.log(statusCode);
  console.log(data);
  console.log(headers);

  expect(QueueEnum.SQS).toBe('SQS');
});
