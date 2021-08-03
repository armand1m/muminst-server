import { NextFunction, Request, Response } from 'express';
import { createReadStream } from 'fs'
import { FileTypeResult, fromFile } from 'file-type';
import { isEmpty } from 'ramda';
import createHttpError from 'http-errors';
import HttpStatusCodes from 'http-status-codes';
import ffmpeg from 'fluent-ffmpeg';

import { db } from '../db';
import { makeSound } from '../model/Sound';
import { buildFilePath } from '../util/buildFilePath';

type ValidExtension = 'mp3' | 'wav' | 'ogg' | 'webm'
type FileExtension = FileTypeResult['ext']

const validExtensions: FileExtension[] = [
  'mp3',
  'wav',
  'ogg',
  'webm',
];

const isValidFile = async (fileType?: FileTypeResult) => {
  if (!fileType) {
    return false;
  }

  return (
    validExtensions.includes(fileType.ext) ||
    fileType.mime === 'audio/mpeg'
  );
};

const processAudioFile = (filePath: string, fileExtension: FileExtension) => {
  return new Promise<void>(async (resolve, reject) => {
    const stream = createReadStream(filePath)

    ffmpeg(stream)
      .audioFilters('loudnorm')
      .on('error', reject)
      .on('end', resolve)
      .format(fileExtension)
      .save(filePath);
  });
}

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
          const fileType = await fromFile(file.tempFilePath);
          const isValid = await isValidFile(fileType);

          if (!isValid) {
            throw new Error(`This type of file is not accepted.`);
          }

          const fileExtension = fileType?.ext as ValidExtension;
          await processAudioFile(file.tempFilePath, fileExtension); 

          const sound = await makeSound(file);
          const hashCheck = db.sounds.getByFileHash(sound.fileHash);

          if (hashCheck) {
            throw new Error(
              `Sound already exists with sound name "${hashCheck.name}"`
            );
          }

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
