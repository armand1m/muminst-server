import { NextFunction, Request, Response } from 'express';
import archiver from 'archiver';
import { Config } from '../config';
import { getCurrentDate } from '../util/getCurrentDate';

const { dbPath, audioPath } = Config.filesystem;

export const downloadSoundsHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    archive.on('warning', function (err) {
      if (err.code === 'ENOENT') {
        req.log.warn(err);
      } else {
        throw err;
      }
    });

    archive.on('error', function (err) {
      throw err;
    });

    archive.on('end', () => res.end());

    archive.directory(dbPath, 'archive/db');
    archive.directory(audioPath, 'archive/audio');

    res
      .attachment(
        `backup-${getCurrentDate().replaceAll('/', '-')}.zip`
      )
      .type('zip');

    archive.pipe(res);
    await archive.finalize();
  } catch (err) {
    next(err);
  }
};
