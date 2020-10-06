import { NextFunction, Request, Response } from 'express';
import { fileService } from '../services/fileService';

export const soundsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sounds = await fileService.listSounds();
    res.json(sounds);
  } catch (err) {
    next(err);
  }
};
