import fs from 'fs';
import { Telegram } from 'telegraf';
import { ChatClient } from './chatClient';
import { TelegramProperties } from '../config';
import { Logger } from 'pino';

let _currentClient: ChatClient | undefined;

const setupClient = async (
  logger: Logger,
  { token, chatId }: TelegramProperties
): Promise<ChatClient> => {
  logger.info('Configuring Telegram client..');
  const telegramClient = new Telegram(token);
  logger.info('Telegram client is ready.');

  return {
    isLocked: () => false,
    playFile: (filename) => {
      telegramClient.sendAudio(chatId, {
        source: fs.createReadStream(filename),
      });
    },
  };
};

export const getTelegramClient = async (
  logger: Logger,
  props: TelegramProperties
) => {
  if (!_currentClient) {
    _currentClient = await setupClient(logger, props);
  }

  return _currentClient;
};
