import { NextFunction, Request, Response } from 'express';
import { MumbleClient } from '../services/mumbleService';

export const channelsHandler = (mumbleClient: MumbleClient) => async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(mumbleClient.getChannels());
  } catch (err) {
    next(err);
  }
};
