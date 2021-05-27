import axios from 'axios';
import { QueueEnum } from '../src/model/queue-enum';

test('temp test', async () => {


  const rs = await new Promise((resolve, reject) => {
    axios.get('').then(res => {
      if (res.status === 200) {
        resolve(res.data);
      }
      resolve(undefined);
    }).catch(err => {
      reject(err);
    });
  });


  console.log(rs);

  expect(QueueEnum.SQS).toBe('SQS');
});
