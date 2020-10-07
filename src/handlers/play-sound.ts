import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import HttpStatusCodes from 'http-status-codes';
import { fileService } from '../services/fileService';

type WithBody<B extends object> = Request<{}, {}, B>;

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
    console.log(mumbleClient.client.connection.writeProto);

    mumbleClient.client.connection
      .writeProto('User', {
        channel: 2,
      })
      .then((e: any) => console.log('then', e))
      .catch((e: any) => console.error('err', e));
    mumbleClient.playFile(
      `${process.env.AUDIO_PATH}/${req.body.soundName}`
    );

    res.json({ audio: true });
  } catch (err) {
    next(err);
  }
};
