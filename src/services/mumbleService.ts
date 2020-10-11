// @ts-ignore
import NoodleJS from 'noodle.js';
import { Config } from '../config';

export interface MumbleChannel {
  children: object;
  links: object;
  id: number;
  name: string;
  position: number;
  parent?: MumbleChannel;
}

export interface MumbleClient {
  getChannels: () => MumbleChannel[];
  getCurrentChannel: () => string;
  playFile: (filename: string) => void;
  stop: () => void;
  setVolume: () => void;
  client: any;
  isLocked: boolean;
}

export const getMumbleClient = () =>
  new Promise<MumbleClient>((resolve) => {
    const client = new NoodleJS({
      url: Config.mumbleUrl,
      name: Config.mumbleUserName,
    });

    let isLocked = false;

    const setLocked = (value: boolean) => {
      isLocked = value;
    };

    client.on('ready', () => {
      resolve({
        getChannels: () => client.channels.array(),
        getCurrentChannel: () => client.user.channel,
        playFile: (filename: string) => {
          setLocked(true);
          client.voiceConnection.playFile(filename);
        },
        stop: client.voiceConnection.stop,
        setVolume: client.voiceConnection.setVolume,
        client,
        isLocked,
      });
    });

    client.voiceConnection.on('end', (_event: any) => {
      setLocked(false);
    });

    client.connect();
  });
