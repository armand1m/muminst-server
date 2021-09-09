import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import HttpStatusCodes from 'http-status-codes';
import { db } from '../db';
import { isNilOrEmpty } from '../util/isNilOrEmpty';

export const addTagHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;

    if (isNilOrEmpty(tags) || isNilOrEmpty(id)) {
      throw createHttpError(
        HttpStatusCodes.BAD_REQUEST,
        'No tags or id specified'
      );
    }

    const sound = db.sounds.get(id);
    if (isNilOrEmpty(sound)) {
      throw createHttpError(
        HttpStatusCodes.NOT_FOUND,
        "Sound doesn't exist"
      );
    }

    const newSound = db.sounds.update(id, {
      ...sound,
      tags: [...sound.tags, ...tags],
    });

    res.status(HttpStatusCodes.OK).json(newSound);
  } catch (error) {
    next(error);
  }
};
