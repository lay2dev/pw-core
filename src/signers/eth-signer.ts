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
      const from = this.from;

      const handleResult = (result): string => {
        let v = Number.parseInt(result.slice(-2), 16);
        if (v >= 27) v -= 27;
        result = result.slice(0, -2) + v.toString(16).padStart(2, '0');
        return result;
      };

      if (typeof window.ethereum !== 'undefined') {
        window.ethereum
          .request({
            method: 'personal_sign',
            params: [from, messages[0].message],
          })
          .then((result) => {
            resolve([handleResult(result)]);
          });
      } else if (!!window.web3) {
        window.web3.currentProvider.sendAsync(
          {
            method: 'personal_sign',
            params: [messages[0].message, from],
            from,
          },
          (err, result) => {
            if (err) {
              reject(err);
            }
            if (result.error) {
              reject(result.error);
            }
            resolve([handleResult(result.result)]);
          }
        );
      } else {
        reject(
          new Error(
            'window.ethereum/window.web3 is undefined, Ethereum environment is required.'
          )
        );
      }
    });
  }
}
