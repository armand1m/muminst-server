import Discord from 'discord.js';
import { Logger } from 'pino';
import { DiscordProperties } from '../config';
import { LockStore } from '../stores/LockStore';
import { buildFilePath } from '../util/buildFilePath';
import { ChatClient } from './chatClient';

const retry = require('async-await-retry');

let _currentClient: ChatClient | undefined;
let _currentConnection: Discord.VoiceConnection | undefined;

const setupClient = (
  logger: Logger,
  lockStore: LockStore,
  { token }: DiscordProperties
) => {
  const playFile = (filename: string) => {
    if (!_currentConnection) {
      throw new Error(
        'You need to invite the bot to a channel first. Join a channel and invite the bot with `/muminst-join` then try again.'
      );
    }

    lockStore.getState().setLocked(true);
    const dispatcher = _currentConnection.play(filename);

    dispatcher.on('finish', () => {
      lockStore.getState().setLocked(false);
      dispatcher.destroy();
    });
  };

  return new Promise<ChatClient>((resolve, reject) => {
    logger.info('Configuring Discord client..');

    const client = new Discord.Client();

    client.on('ready', () => {
      logger.info('Discord client is ready.');

      if (client.user) {
        logger.info(`Logged in as ${client.user.tag}`);
      }

      resolve({
        isLocked: () => lockStore.getState().isLocked,
        playFile,
        playSound: (sound) => {
          const filepath = buildFilePath(sound);
          /** TODO: Send message to discord channel as well */
          playFile(filepath);
        },
      });
    });

    client.on('error', (err) => {
      logger.info('Discord Client suffered an error');
      reject(err);
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

        logger.info(
          `Discord Client joined channel "${channel.name}"`
        );
      }
    });

    client.login(token);
  });
};

export const getDiscordClient = async (
  logger: Logger,
  lockStore: LockStore,
  props: DiscordProperties
) => {
  if (!_currentClient) {
    _currentClient = await retry(() => {
      return setupClient(logger, lockStore, props);
    });
  }

  return _currentClient;
};
