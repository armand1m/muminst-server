// @ts-ignore
import NoodleJS from 'noodle.js';
import { Config } from '../config';

const client = new NoodleJS({
  url: Config.mumbleUrl,
  name: Config.mumbleUserName,
});

client.connect();

export const mumbleClient = {
  getChannels: () => client.channels.array(),
  getCurrentChannel: () => client.user.channel,
  playFile: (filename: string) =>
    client.voiceConnection.playFile(filename),
  stop: client.voiceConnection.stop,
  setVolume: client.voiceConnection.setVolume,
};
