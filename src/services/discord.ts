import Discord from 'discord.js';
import { DiscordProperties } from '../config';
import { LockStore } from '../stores/LockStore';
import { ChatClient } from './chatClient';

let _currentClient: ChatClient | undefined;
let _currentConnection: Discord.VoiceConnection | undefined;

const setupClient = (token: string, lockStore: LockStore) => {
  const playFile = (filename: string) => {
    lockStore.getState().setLocked(true);

    if (!_currentConnection) {
      throw new Error(
        'You need to invite the bot to a channel first. Join a channel and invite the bot with `/muminst-join` then try again.'
      );
    }

    const dispatcher = _currentConnection.play(filename);

    dispatcher.on('finish', () => {
      lockStore.getState().setLocked(false);
      dispatcher.destroy();
    });
  };

  return new Promise<ChatClient>((resolve) => {
    console.log('Configuring Discord client..');

    const client = new Discord.Client();

    client.on('ready', () => {
      console.log('Discord client is ready.');
      if (client.user) {
        console.log(`Logged in as ${client.user.tag}!`);
      }
    });

    client.on('message', async (message) => {
      if (!message.guild) return;

      if (message.content === '/muminst-join') {
        const channel = message.member?.voice.channel;

        if (!channel) {
          message.reply('You need to join a voice channel first.');
          return;
        }

        if (_currentConnection) {
          _currentConnection.disconnect();
        }

        _currentConnection = await channel.join();

        console.log(
          `Discord Client joined channel "${channel.name}"`
        );
      }
    });

    client.login(token);

    resolve({
      isLocked: () => lockStore.getState().isLocked,
      playFile,
    });
  });
};

export const getDiscordClient = async ({
  token,
  lockStore,
}: DiscordProperties) => {
  if (!_currentClient) {
    _currentClient = await setupClient(token, lockStore);
  }

  return _currentClient;
};
