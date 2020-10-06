import { Request, Response } from 'express';
import { mumbleClient } from '../services/mumbleService';

export const channelsHandler = async (
  _req: Request,
  res: Response
) => {
  res.json(mumbleClient.getChannels());
};
