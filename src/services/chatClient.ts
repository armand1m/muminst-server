export interface ChatClient {
  isLocked: () => boolean;
  playFile: (filename: string) => void;
}
