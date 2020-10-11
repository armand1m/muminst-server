import path from 'path';

export const splitFileName = (fileName: string) => {
  try {
    const extension = path.extname(fileName);
    const name = path.basename(fileName, extension);

    return { name, extension };
  } catch (err) {
    console.error(err);
    throw new Error(`Failed to parse filename: "${fileName}"`);
  }
};
