import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import expressWebSocket from 'express-ws';
import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import pinoHttp from 'pino-http';

import { logger } from './logger';
import { Config } from './config';
import { soundsHandler } from './handlers/sounds';
import { uploadHandler } from './handlers/upload';
import { playSoundHandler } from './handlers/playSound';
import { ErrorMiddleware } from './middlewares/ErrorMiddleware';
import { ConfigMiddleware } from './middlewares/ConfigMiddleware';
import { NotFoundMiddleware } from './middlewares/NotFoundMiddleware';
import { InjectClientMiddleware } from './middlewares/InjectClientMiddleware';
import { getMumbleClient } from './services/mumble';
import { getDiscordClient } from './services/discord';
import { getTelegramClient } from './services/telegram';
import { createLockStore } from './stores/LockStore';
import { downloadSoundsHandler } from './handlers/downloadSounds';
import { addTagHandler } from './handlers/addTag';

const { proto, hostname, port } = Config.metadata;

const httpServerLogger = logger.child({ source: 'http-server' });
const wsLogger = logger.child({ source: 'ws-server' });

const main = async () => {
  const lockStore = createLockStore();
  const clients = {
    mumble: Config.features.mumble
      ? await getMumbleClient(
          logger.child({ source: 'mumble-client' }),
          lockStore,
          Config.mumble
        )
      : undefined,
    discord: Config.features.discord
      ? await getDiscordClient(
          logger.child({ source: 'discord-client' }),
          lockStore,
          Config.discord
        )
      : undefined,
    telegram: Config.features.telegram
      ? await getTelegramClient(
          logger.child({ source: 'telegram-client' }),
          Config.telegram
        )
      : undefined,
  };

  const { app } = expressWebSocket(express());

  const wsRouter = express.Router();

  wsRouter.ws('/ws', function (ws, _req) {
    const unsubscribeLockStore = lockStore.subscribe((state) => {
      if (ws.readyState === ws.OPEN) {
        const payload = JSON.stringify({
          isLocked: state.isLocked,
        });

        ws.send(payload, (err) => {
          if (err) {
            wsLogger.error(
              'Error while sending message to the client.'
            );
            wsLogger.error(err);
          }
        });
      }
    });

    /** Connection recycling. */
    const recyclingInterval = setInterval(() => {
      if (ws.readyState === ws.CLOSED) {
        wsLogger.info(
          'Client connection got closed. Terminating connection and listeners.'
        );
        ws.terminate();
        unsubscribeLockStore();
        clearInterval(recyclingInterval);
      }
    }, 30000);
  });

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
    .use(pinoHttp({ logger: httpServerLogger }))
    .use(cors())
    .use(fileUpload())
    .use(bodyParser.json())
    .use(ConfigMiddleware)
    .use(InjectClientMiddleware(clients))
    .use('/assets', express.static(Config.filesystem.audioPath))
    .get('/sounds', soundsHandler)
    .get('/download-sounds', downloadSoundsHandler)
    .post('/play-sound', playSoundHandler)
    .post('/upload', uploadHandler)
    .put('/add-tags/:id', addTagHandler)
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
      httpServerLogger.info(
        `HTTP Server listening at ${proto}://${hostname}:${port}`
      );
      wsLogger.info(
        `WS Server listening at ws://${hostname}:${port}`
      );
    });
};

main();
