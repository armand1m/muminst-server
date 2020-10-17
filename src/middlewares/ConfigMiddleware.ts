import { Request, Response, NextFunction } from 'express';
import { Config } from '../config';

export function ConfigMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  req.config = Config;
  next();
}
