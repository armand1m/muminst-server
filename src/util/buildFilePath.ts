import { Config } from '../config';
import { Sound } from '../model/Sound';

export const buildFilePath = (sound: Sound) =>
  `${Config.audioPath}/${sound.fileHash}.${sound.extension}`;
