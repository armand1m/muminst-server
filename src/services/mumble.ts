// @ts-ignore
import NoodleJS from 'noodle.js';
import { MumbleProperties } from '../config';
import { ChatClient } from './chatClient';

let _isLocked = false;
let _currentClient: ChatClient | undefined;

export const isLocked = () => {
  return _isLocked;
};

const setLocked = (value: boolean) => {
  _isLocked = value;
};

const setupClient = ({ url, username }: MumbleProperties) => {
  return new Promise<ChatClient>((resolve) => {
    console.log('Configuring Mumble Client..');

    const client = new NoodleJS({
      url,
      name: username,
    });

    client.on('ready', () => {
      console.log('Mumble Client is ready.');

      const playFile = (filename: string) => {
        setLocked(true);
        client.voiceConnection.playFile(filename);
      };

      resolve({
        isLocked,
        playFile,
      });
    });

    client.voiceConnection.on('end', (_event: any) => {
      setLocked(false);
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
