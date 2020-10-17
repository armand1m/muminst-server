import fs from 'fs';
import { Telegram } from 'telegraf';
import { ChatClient } from './chatClient';
import { TelegramProperties } from '../config';

let _currentClient: ChatClient | undefined;

const setupClient = async ({
  token,
  chatId,
}: TelegramProperties): Promise<ChatClient> => {
  console.log('Configuring Telegram client..');
  const telegramClient = new Telegram(token);
  console.log('Telegram client is ready.');

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
  props: TelegramProperties
) => {
  if (!_currentClient) {
    _currentClient = await setupClient(props);
  }

  return _currentClient;
};
