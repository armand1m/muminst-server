import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import HttpStatusCodes from 'http-status-codes';
import { fileService } from '../services/fileService';
import { mumbleClient } from '../services/mumbleService';

type WithBody<B extends object> = Request<{}, {}, B>;

export const playSoundHandler = async (
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

    mumbleClient.playFile(
      `${process.env.AUDIO_PATH}/${req.body.soundName}`
    );

    res.json({ audio: true });
  } catch (err) {
    next(err);
  }
};
