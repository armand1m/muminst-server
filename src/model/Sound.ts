import hasha from 'hasha';
import { UploadedFile } from 'express-fileupload';
import { createUUID } from '../util/createUUID';
import { splitFileName } from '../util/splitFileName';

export type Sound = {
  name: string;
  id: string;
  extension: string;
  fileHash: string;
  fileName: string;
  tags: string[];
};

export const makeSound = async (
  file: UploadedFile
): Promise<Sound> => {
  const uuid = createUUID();
  const fileName = createUUID();
  const fileHash = await hasha.async(file.data, {
    algorithm: 'sha256',
  });
  const { name, extension } = splitFileName(file.name);

  return {
    name,
    extension,
    fileName,
    fileHash,
    id: uuid,
    tags: [],
  };
};
