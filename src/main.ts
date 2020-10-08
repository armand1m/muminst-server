import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { Config } from './config';
import { soundsHandler } from './handlers/sounds';
import { channelsHandler } from './handlers/channels';
import { playSoundHandler } from './handlers/play-sound';
import { ErrorMiddleware } from './middlewares/ErrorMiddleware';
import { NotFoundMiddleware } from './middlewares/NotFoundMiddleware';
import { getMumbleClient } from './services/mumbleService';
import fileUpload from 'express-fileupload';
import { uploadHandler } from './handlers/upload';

getMumbleClient()
  .then((mumbleClient) => {
    const app = express();
    app
      .use(cors())
      .use(fileUpload)
      .use(bodyParser.json())
      .get('/sounds', soundsHandler)
      .get('/channels', channelsHandler(mumbleClient))
      .post('/play-sound', playSoundHandler(mumbleClient))
      .post('/upload', uploadHandler)
      .use(NotFoundMiddleware)
      .use(ErrorMiddleware)
      .listen(Config.port, () => {
        console.log(
          `Example app listening at http://${Config.hostname}:${Config.port}`
        );
      });
  })
  .catch((err) => {
    throw new Error(err);
  });
