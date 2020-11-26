import pino from 'pino';
import { Config } from './config';

export const logger = pino({
  prettyPrint: Config.metadata.environment === 'development',
});
