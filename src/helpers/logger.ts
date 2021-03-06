import { configure, getLogger } from 'log4js';
export const logger = getLogger('@force-bridge/core');
configure({
  appenders: {
    out: {
      type: 'stdout',
      layout: {
        // ref: https://github.com/log4js-node/log4js-node/blob/master/docs/layouts.md
        type: 'pattern',
        pattern: '%[[%d %p %f{2}:%l]%] %m%n',
      },
    },
  },
  categories: {
    default: { appenders: ['out'], level: 'debug', enableCallStack: true },
  },
});
