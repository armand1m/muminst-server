import { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import HttpStatusCodes from 'http-status-codes';
import { SupportedChatClient } from '../config';
import { db } from '../db';
import { buildFilePath } from '../util/buildFilePath';

type WithBody<B extends object> = Request<{}, {}, B>;

type SoundHandlerRequest = WithBody<{
  client: SupportedChatClient;
  soundId: string;
}>;

export const playSoundHandler = async (
  req: SoundHandlerRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { soundId, client } = req.body;

    if (!client) {
      throw createHttpError(
        HttpStatusCodes.BAD_REQUEST,
        'The client property is required in the payload. Specify either "discord", "mumble" or "telegram".'
      );
    }

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

    const chatClient = req.clients[client];

    if (!chatClient) {
      throw createHttpError(
        HttpStatusCodes.SERVICE_UNAVAILABLE,
        `The client "${client}" is not available in this deployment of Muminst. Contact the service administrator.`
      );
    }

    if (chatClient.isLocked()) {
      throw createHttpError(
        HttpStatusCodes.LOCKED,
        `There is an audio being played at the moment. Try again later.`
      );
    }

    chatClient.playFile(buildFilePath(sound));

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
