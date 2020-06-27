import { Signer, Message } from '.';
import { Keccak256Hasher } from '../hashers';
// import {
//   ecsign,
//   bufferToHex,
//   toBuffer,
//   setLengthLeft,
//   hashPersonalMessage,
// } from 'ethereumjs-util';

// const a = '2A77A5C9DBA59D6F8B7A';
// const b = '2737A8A6D8E511CDC9439';
// const c = 'C97E919959D02502F8BCB50';

// function sendSync({ params }) {
//   const msg = hashPersonalMessage(toBuffer(params[0]))
//     .toString('hex')
//     .replace('0x', '');

//   const { r, s, v } = ecsign(
//     new Buffer(msg, 'hex'),
//     new Buffer(`${a}${b}${c}`, 'hex')
//   );

//   const hexsig = bufferToHex(
//     Buffer.concat([
//       setLengthLeft(r, 32),
//       setLengthLeft(s, 32),
//       toBuffer(v - 27),
//     ])
//   );

//   return hexsig;
// }

export class EthSigner extends Signer {
  constructor(public readonly from: string) {
    super(new Keccak256Hasher());
  }

  signMessages(messages: Message[]): Promise<string[]> {
    return new Promise((resolve, reject) => {
      /*
      try {
        const sig = sendSync({ params: [messages[0].message] });
        resolve([sig]);
      } catch (e) {
        reject(e);
      }
      */

      const from = this.from;
      const params = [messages[0].message, from];
      const method = 'personal_sign';

      window.web3.currentProvider.sendAsync(
        { method, params, from },
        (err, result) => {
          if (err) {
            reject(err);
          }
          if (result.error) {
            reject(result.error);
          }
          result = result.result;
          let v = Number.parseInt(result.slice(-2), 16);
          if (v >= 27) v -= 27;
          result = result.slice(0, -2) + v.toString(16).padStart(2, '0');
          resolve([result]);
        }
      );
    });
  }
}
