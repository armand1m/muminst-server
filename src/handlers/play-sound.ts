import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import HttpStatusCodes from 'http-status-codes';
import { fileService } from '../services/fileService';

type WithBody<B extends object> = Request<{}, {}, B>;

let lock = false;

export const playSoundHandler = (mumbleClient: any) => async (
  req: WithBody<{ soundName: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const sounds = await fileService.listSounds();

    if (!sounds.includes(req.body.soundName)) {
      throw createHttpError(
        HttpStatusCodes.BAD_REQUEST,
        'Sound is not available.'
      );
    }
    const client = mumbleClient.client;

    if (lock) {
      res.json({ success: false });
      return;
    }

    client.voiceConnection.on('end', (a: any) => {
      lock = false;
    });

    client.voiceConnection.playFile(
      `${process.env.AUDIO_PATH}/${req.body.soundName}`
    );
    lock = true;

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
