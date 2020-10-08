import { Request, Response } from 'express';
import { db } from '../db';
import { makeSound } from '../model/Sound';
import { buildFilePath } from '../util/buildFilePath';

export const uploadHandler = async (req: Request, res: Response) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  const allFilesMove = Promise.all(
    Object.values(req.files).map(async (file) => {
      const sound = makeSound(file.name);
      try {
        db.sounds.add(sound);
        await file.mv(buildFilePath(sound));
        return { error: false };
      } catch (err) {
        return { error: true };
      }
    })
  );

  return allFilesMove.then((files) =>
    files.filter(({ error }) => error).length
      ? res.status(500).send('Error uploading files')
      : res.send('Upload successful')
  );
};
