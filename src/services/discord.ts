import Discord from 'discord.js';
import { Logger } from 'pino';
// @ts-ignore
import retry from 'async-await-retry';
import { DiscordProperties } from '../config';
import { LockStore } from '../stores/LockStore';
import { buildFilePath } from '../util/buildFilePath';
import { ChatClient } from './chatClient';

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

  return new Promise<ChatClient>((resolve) => {
    logger.info('Configuring Discord client..');

    const client = new Discord.Client();

    client.on('ready', () => {
      logger.info('Discord client is ready.');
      if (client.user) {
        logger.info(`Logged in as ${client.user.tag}`);
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

        logger.info(
          `Discord Client joined channel "${channel.name}"`
        );
      }
    });

    client.login(token);

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
};

export const getDiscordClient = async (
  logger: Logger,
  lockStore: LockStore,
  props: DiscordProperties
) => {
  if (!_currentClient) {
    _currentClient = await retry(() =>
      setupClient(logger, lockStore, props)
    );
  }

  return _currentClient;
};
