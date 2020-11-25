import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import expressWebSocket from 'express-ws';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';

import { Config, SupportedChatClient } from './config';
import { soundsHandler } from './handlers/sounds';
import { uploadHandler } from './handlers/upload';
import { playSoundHandler } from './handlers/playSound';
import { ErrorMiddleware } from './middlewares/ErrorMiddleware';
import { ConfigMiddleware } from './middlewares/ConfigMiddleware';
import { NotFoundMiddleware } from './middlewares/NotFoundMiddleware';
import { InjectClientMiddleware } from './middlewares/InjectClientMiddleware';
import { ChatClient } from './services/chatClient';
import { getMumbleClient } from './services/mumble';
import { getDiscordClient } from './services/discord';
import { getTelegramClient } from './services/telegram';
import { createLockStore } from './stores/LockStore';

const { proto, hostname, port } = Config.metadata;

const main = async () => {
  const { app } = expressWebSocket(express());

  const lockStore = createLockStore();
  const wsRouter = express.Router();

  wsRouter.ws('/ws', function (ws, req) {
    lockStore.subscribe((state) => {
      ws.send(
        JSON.stringify({
          isLocked: state.isLocked,
        })
      );
    });
  });

  const withLockStore = <T>(config: T) => ({
    ...config,
    lockStore,
  });

  const clients: Record<
    SupportedChatClient,
    ChatClient | undefined
  > = {
    mumble: Config.features.mumble
      ? await getMumbleClient(withLockStore(Config.mumble))
      : undefined,
    discord: Config.features.discord
      ? await getDiscordClient(withLockStore(Config.discord))
      : undefined,
    telegram: Config.features.telegram
      ? await getTelegramClient(withLockStore(Config.telegram))
      : undefined,
  };

  Sentry.init({
    dsn:
      'https://ad50cb3f5a5342d0bed25d51fb2040be@o480339.ingest.sentry.io/5527679',
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],
    // We recommend adjusting this value in production,
    // or using tracesSampler for finer control
    tracesSampleRate: 1.0,
  });

  app
    // RequestHandler creates a separate execution context using domains, so that
    // every transaction/span/breadcrumb is attached to its own Hub instance
    .use(Sentry.Handlers.requestHandler())
    // TracingHandler creates a trace for every incoming request
    .use(Sentry.Handlers.tracingHandler())
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
    .use(wsRouter)
    .use(
      Sentry.Handlers.errorHandler({
        shouldHandleError(error) {
          if (!error?.status) {
            return false;
          }

          return error.status > 400;
        },
      })
    )
    .use(NotFoundMiddleware)
    .use(ErrorMiddleware)
    .listen(port, () => {
      console.log(
        `Muminst server listening at ${proto}://${hostname}:${port}\n` +
          `Muminst websocket listening at ws://${hostname}:${port}`
      );
    });
};

main();
