// @ts-ignore
import NoodleJS from 'noodle.js';
import { Logger } from 'pino';
import { MumbleProperties } from '../config';
import { LockStore } from '../stores/LockStore';
import { ChatClient } from './chatClient';

let _currentClient: ChatClient | undefined;

const setupClient = (
  logger: Logger,
  lockStore: LockStore,
  { url, username }: MumbleProperties
) => {
  return new Promise<ChatClient>((resolve) => {
    logger.info('Configuring Mumble Client..');

    const client = new NoodleJS({
      url,
      name: username,
    });

    client.on('ready', () => {
      logger.info('Mumble Client is ready.');

      const playFile = (filename: string) => {
        lockStore.getState().setLocked(true);
        client.voiceConnection.playFile(filename);
      };

      resolve({
        isLocked: () => lockStore.getState().isLocked,
        playFile,
      });
    });

    client.voiceConnection.on('end', (_event: any) => {
      lockStore.getState().setLocked(false);
    });

    client.connect();
  });
};

export const getMumbleClient = async (
  logger: Logger,
  lockStore: LockStore,
  props: MumbleProperties
) => {
  if (!_currentClient) {
    _currentClient = await setupClient(logger, lockStore, props);
  }

  return _currentClient;
};
