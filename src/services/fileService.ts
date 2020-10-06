import fs from 'fs';
import { Config } from '../config';

const hasAudioExtension = (file: string) =>
  file.match(/\.(?:wav|mp3)$/i);

const listSounds = async () => {
  const files = await fs.promises.readdir(Config.audioPath, {});
  return files.filter(hasAudioExtension);
};

export const fileService = {
  listSounds,
};
