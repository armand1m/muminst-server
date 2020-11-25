// @ts-ignore
import NoodleJS from 'noodle.js';
import { MumbleProperties } from '../config';
import { ChatClient } from './chatClient';

let _currentClient: ChatClient | undefined;

const setupClient = ({
  url,
  username,
  lockStore,
}: MumbleProperties) => {
  return new Promise<ChatClient>((resolve) => {
    console.log('Configuring Mumble Client..');

    const client = new NoodleJS({
      url,
      name: username,
    });

    client.on('ready', () => {
      console.log('Mumble Client is ready.');

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

export const getMumbleClient = async (props: MumbleProperties) => {
  if (!_currentClient) {
    _currentClient = await setupClient(props);
  }

  return _currentClient;
};
