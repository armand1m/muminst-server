import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import HttpStatusCodes from 'http-status-codes';
import { db } from '../db';
import { buildFilePath } from '../util/buildFilePath';

type WithBody<B extends object> = Request<{}, {}, B>;

let lock = false;

export const playSoundHandler = (mumbleClient: any) => async (
  req: WithBody<{ soundId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { soundId } = req.body;

    if (!soundId) {
      throw createHttpError(
        HttpStatusCodes.BAD_REQUEST,
        'Bad soundId.'
      );
    }

    const sound = db.sounds.get(soundId);

    if (!sound) {
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

    client.voiceConnection.playFile(buildFilePath(sound));

    lock = true;

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
