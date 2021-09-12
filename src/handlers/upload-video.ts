import { NextFunction, Request, Response } from 'express';
import { createWriteStream } from 'fs';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';

export const uploadHandler = async (
  req: Request<
    any,
    any,
    { url: string; begin: number; end: number; name: string }
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const stream = ytdl(req.body.url);
    const path = `${req.body.name}-temp.mp4`;
    stream.pipe(createWriteStream(path));

    stream.on('end', () => {
      ffmpeg(path).noVideo();
    });
    // res.json({
    //   failed,
    //   successful,
    // });
  } catch (err) {
    next(err);
  }
};
