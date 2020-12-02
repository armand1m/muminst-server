import { Sound } from '../model/Sound';

export interface ChatClient {
  isLocked: () => boolean;
  playFile: (filename: string) => void;
  playSound: (sound: Sound) => void;
}
