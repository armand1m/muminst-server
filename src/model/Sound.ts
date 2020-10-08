import { createUUID } from '../util/createUUID';
import { splitFileName } from '../util/splitFileName';

export type Sound = {
  name: string;
  id: string;
  extension: string;
  fileHash: string;
};

export const makeSound = (fileName: string): Sound => {
  const uuid = createUUID();
  const fileHash = createUUID();
  const { name, extension } = splitFileName(fileName);

  return {
    name,
    extension,
    fileHash,
    id: uuid,
  };
};
