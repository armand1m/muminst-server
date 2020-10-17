import path from 'path';
import { Config } from '../config';
import { Sound } from '../model/Sound';

export const buildFilePath = (sound: Sound) =>
  path.resolve(
    Config.filesystem.audioPath,
    `${sound.fileName}${sound.extension}`
  );
