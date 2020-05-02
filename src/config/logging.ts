const winston = require('winston');
// import os from 'os';
// import fs from 'fs';
// import 'winston-daily-rotate-file';

import config from './config';

// tslint:disable-next-line: no-require-imports
let { createLogger, format } = winston;
winston.transports.DailyRotateFile = require('winston-daily-rotate-file');

const { combine, timestamp, label, printf } = format;

// tslint:disable-next-line: no-shadowed-variable
const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

// const files = new (transports.File)({ filename: __dirname+'/../../../exp/sse_out.log'});
const myconsole = new (winston.transports.Console)();

const files = new (winston.transports.DailyRotateFile)({
  filename: config.logsPath + '/' + config.appName + '-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '20m',
  maxFiles: '14d',
});

const logger = createLogger({
  format: combine(
    label({ label: '[' + config.environment + ']' }),
    timestamp(),
    myFormat,
  ),
  transports: [myconsole, files],
});

/***
module.exports = function () {
  return logger;
};
**/
export default logger;
