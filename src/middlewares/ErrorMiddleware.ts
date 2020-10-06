import { HttpException } from '../exceptions/HttpException';
import { Request, Response, NextFunction } from 'express';

export function ErrorMiddleware(
  err: HttpException,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (err) {
    if (!res.writableEnded) {
      const status = err.status || 500;
      const title = err.message || err.toString();

      /** @see https://tools.ietf.org/html/rfc7807 */
      return res.status(status).json({ title, status }).end();
    }
  }

  next();
}
