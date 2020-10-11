import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fileUpload from 'express-fileupload';
import { Config } from './config';
import { soundsHandler } from './handlers/sounds';
import { channelsHandler } from './handlers/channels';
import { playSoundHandler } from './handlers/play-sound';
import { ErrorMiddleware } from './middlewares/ErrorMiddleware';
import { NotFoundMiddleware } from './middlewares/NotFoundMiddleware';
import { getMumbleClient } from './services/mumbleService';
import { uploadHandler } from './handlers/upload';

const main = async () => {
  const mumbleClient = await getMumbleClient();

  express()
    .use(cors())
    .use(fileUpload())
    .use(bodyParser.json())
    .get('/sounds', soundsHandler)
    .get('/channels', channelsHandler(mumbleClient))
    .post('/play-sound', playSoundHandler(mumbleClient))
    .post('/upload', uploadHandler)
    .use(NotFoundMiddleware)
    .use(ErrorMiddleware)
    .listen(Config.port, () => {
      console.log(
        `Muminst server listening at ${Config.proto}://${Config.hostname}:${Config.port}`
      );
    });
};

main();
