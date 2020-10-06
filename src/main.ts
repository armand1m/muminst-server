import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Config } from './config';
import { soundsHandler } from './handlers/sounds';
import { channelsHandler } from './handlers/channels';
import { playSoundHandler } from './handlers/play-sound';
import { ErrorMiddleware } from './middlewares/ErrorMiddleware';
import { NotFoundMiddleware } from './middlewares/NotFoundMiddleware';

const app = express();

app
  .use(cors())
  .use(bodyParser.json())
  .get('/sounds', soundsHandler)
  .get('/channels', channelsHandler)
  .post('/play-sound', playSoundHandler)
  .use(NotFoundMiddleware)
  .use(ErrorMiddleware)
  .listen(Config.port, () => {
    console.log(
      `Example app listening at http://${Config.hostname}:${Config.port}`
    );
  });
