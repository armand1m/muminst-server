import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import { Config, SupportedChatClient } from './config';
import { soundsHandler } from './handlers/sounds';
import { playSoundHandler } from './handlers/playSound';
import { ErrorMiddleware } from './middlewares/ErrorMiddleware';
import { NotFoundMiddleware } from './middlewares/NotFoundMiddleware';
import { uploadHandler } from './handlers/upload';
import { ConfigMiddleware } from './middlewares/ConfigMiddleware';
import { InjectClientMiddleware } from './middlewares/InjectClientMiddleware';
import { ChatClient } from './services/chatClient';
import { getMumbleClient } from './services/mumble';
import { getDiscordClient } from './services/discord';
import { getTelegramClient } from './services/telegram';

const { proto, hostname, port } = Config.metadata;

const main = async () => {
  const clients: Record<
    SupportedChatClient,
    ChatClient | undefined
  > = {
    mumble: Config.features.mumble
      ? await getMumbleClient(Config.mumble)
      : undefined,
    discord: Config.features.discord
      ? await getDiscordClient(Config.discord)
      : undefined,
    telegram: Config.features.telegram
      ? await getTelegramClient(Config.telegram)
      : undefined,
  };

  express()
    .use(cors())
    .use(fileUpload())
    .use(bodyParser.json())
    .use(ConfigMiddleware)
    .use(InjectClientMiddleware(clients))
    .get('/sounds', soundsHandler)
    .post('/play-sound', playSoundHandler)
    .post('/upload', uploadHandler)
    .use(NotFoundMiddleware)
    .use(ErrorMiddleware)
    .listen(port, () => {
      console.log(
        `Muminst server listening at ${proto}://${hostname}:${port}`
      );
    });
};

main();
