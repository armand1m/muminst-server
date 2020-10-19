import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
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
    .use(
      morgan(
        ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms'
      )
    )
    .use(cors())
    .use(fileUpload())
    .use(bodyParser.json())
    .use(ConfigMiddleware)
    .use(InjectClientMiddleware(clients))
    .use('/assets', express.static(Config.filesystem.audioPath))
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
