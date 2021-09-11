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
      fs.readFileSync(`${dbPath}/database.json`)
    );

    const audios = fs.readdirSync(audioPath);

    audios.map((fileName) =>
      zip.file(
        `audios/${fileName}`,
        fs.readFileSync(`${audioPath}/${fileName}`)
      )
    );

    zip.generateAsync({ type: 'base64' }).then((zipFile) => {
      const buffer = Buffer.from(zipFile, 'base64');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=backup-${getCurrentDate()}.zip`
      );
      res.setHeader('Content-Type', 'application/zip');
      res.send(buffer);
    });
  } catch (err) {
    next(err);
  }
};
