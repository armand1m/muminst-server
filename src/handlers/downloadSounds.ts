import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import JSZip from 'jszip';
import { Config } from '../config';
import { db } from '../db';
import { Sound } from '../model/Sound';
import { buildFilePath } from '../util/buildFilePath';
import { getCurrentDate } from '../util/getCurrentDate';

const { dbPath } = Config.filesystem;

export const downloadSoundsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const zip = new JSZip();

    zip
      .folder('db')
      ?.file(
        'database.json',
        await fs.promises.readFile(`${dbPath}/database.json`)
      );

    const files = await Promise.all(
      db.sounds
        .list()
        .map<Promise<[Sound, Buffer]>>(async (sound) => [
          sound,
          await fs.promises.readFile(buildFilePath(sound)),
        ])
    );

    files.map(([sound, file]) => {
      zip
        .folder('sounds')
        ?.file(`${sound.fileName}${sound.extension}`, file);
    });

    const buffer = Buffer.from(
      await zip.generateAsync({ type: 'base64' }),
      'base64'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=backup-${getCurrentDate()}.zip`
    );
    res.setHeader('Content-Type', 'application/zip');
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};
