import { NextFunction, Request, Response } from 'express';
import { isEmpty } from 'ramda';
import createHttpError from 'http-errors';
import HttpStatusCodes from 'http-status-codes';
import { db } from '../db';
import { makeSound } from '../model/Sound';
import { buildFilePath } from '../util/buildFilePath';

/**
 * Upload Handler
 *
 * TODO:
 *
 * [ ] Create upload file hash so we can check if the file already exists in case it gets uploaded again.
 *
 * @param req
 * @param res
 * @param next
 */
export const uploadHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.files || isEmpty(req.files)) {
      throw createHttpError(
        HttpStatusCodes.BAD_REQUEST,
        'No files were uploaded'
      );
    }

    const allFilesMove = await Promise.all(
      Object.values(req.files).map(async (file) => {
        try {
          const sound = makeSound(file.name);

          await db.sounds.add(sound);
          await file.mv(buildFilePath(sound));

          return {
            status: 'success',
            data: {
              id: sound.id,
              filename: file.name,
            },
          };
        } catch (error) {
          return {
            status: 'error',
            data: {
              filename: file.name,
              reason: error.message,
            },
          };
        }
      })
    );

    const failed = allFilesMove
      .filter((result) => result.status === 'error')
      .map((result) => result.data);

    const successful = allFilesMove
      .filter((result) => result.status === 'success')
      .map((result) => result.data);

    res.json({
      failed,
      successful,
    });
  } catch (err) {
    next(err);
  }
};
