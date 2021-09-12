import { NextFunction, Request, Response } from 'express';
import fs from 'fs';
import JSZip from 'jszip';
import { Config } from '../config';
import { getCurrentDate } from '../util/getCurrentDate';

const { dbPath, audioPath } = Config.filesystem;

export const downloadSoundsHandler = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const zip = new JSZip();
    zip.file(
      'database.json',
      await fs.promises.readFile(`${dbPath}/database.json`)
    );

    const sounds = await fs.promises.readdir(audioPath);

    sounds.map(async (fileName) =>
      zip.file(
        `sounds/${fileName}`,
        await fs.promises.readFile(`${audioPath}/${fileName}`)
      )
    );

    const zipFile = await zip.generateAsync({ type: 'base64' });
    const buffer = Buffer.from(zipFile, 'base64');
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
