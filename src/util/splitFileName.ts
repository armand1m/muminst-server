export const splitFileName = (fileName: string) => {
  const FILENAME_REGEX = /(.*)\.([a-zA-Z0-9]+)/;
  const matches = fileName.match(FILENAME_REGEX);
  if (!matches || matches.length < 3) {
    console.error({ fileName, matches });
    throw new Error('Error while parsing filename');
  }
  const [, name, extension] = matches;
  return { name, extension };
};
