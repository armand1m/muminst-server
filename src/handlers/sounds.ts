import { NextFunction, Request, Response } from 'express';
import { db } from '../db';

export const soundsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json(db.sounds.list());
  } catch (err) {
    next(err);
  }
};
