import { NodeGrumble } from 'node-grumble';
import { Logger } from 'pino';
import { MumbleProperties } from '../config';
import { LockStore } from '../stores/LockStore';
import { ChatClient } from './chatClient';

let _currentClient: ChatClient | undefined;

const setupClient = async (
  logger: Logger,
  lockStore: LockStore,
  { url, username }: MumbleProperties
) => {
  logger.info('Configuring Mumble Client..');

  const connection = await NodeGrumble.connect({
    url,
    name: username,
  });

  logger.info('Mumble Client Connected.');

  const playFile = async (filename: string) => {
    const lockState = lockStore.getState();
    lockState.setLocked(true);
    await connection.playFile(filename);
    lockState.setLocked(false);
  };

  const isLocked = () => lockStore.getState().isLocked;

  return {
    isLocked,
    playFile,
  };
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
