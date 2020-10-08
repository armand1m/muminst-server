import { Request, Response } from 'express';
import { db, filePath, makeSound } from '../db';

export const uploadHandler = async (req: Request, res: Response) => {
  console.log('uploadHandler');
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('No files were uploaded.');
  }

  console.log(req.files);

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  const sampleFile = req.files.sampleFile;
  const sound = makeSound(sampleFile.name);

  db.sounds.add(sound);

  // Use the mv() method to place the file somewhere on your server
  return sampleFile.mv(filePath(sound), (err) =>
    err ? res.status(500).send(err) : res.send('File uploaded!')
  );
};
