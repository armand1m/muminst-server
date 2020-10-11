import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import HttpStatusCodes from 'http-status-codes';
import { db } from '../db';
import { MumbleClient } from '../services/mumbleService';
import { buildFilePath } from '../util/buildFilePath';

type WithBody<B extends object> = Request<{}, {}, B>;

export const playSoundHandler = (
  mumbleClient: MumbleClient
) => async (
  req: WithBody<{ soundId: string }>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { soundId } = req.body;

    if (!soundId) {
      throw createHttpError(
        HttpStatusCodes.BAD_REQUEST,
        'The soundId property is required in the payload.'
      );
    }

    const sound = db.sounds.get(soundId);

    if (!sound) {
      throw createHttpError(
        HttpStatusCodes.NOT_FOUND,
        `Sound with soundId "${soundId}" does not exist.`
      );
    }

    if (mumbleClient.isLocked()) {
      res.json({ success: false });
      return;
    }

    mumbleClient.playFile(buildFilePath(sound));

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
