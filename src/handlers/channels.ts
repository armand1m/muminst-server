import { Request, Response } from 'express';

export const channelsHandler = (mumbleClient: any) => async (
  _req: Request,
  res: Response
) => {
  res.json(mumbleClient.getChannels());
};
