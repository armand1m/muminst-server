import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { Config } from './config';
import { createUUID } from './uuid';

const adapter = new FileSync('./data/db.json');

type State = {
  sounds: Sound[];
};

const _db = low<low.AdapterSync<State>>(adapter).defaults<State>({
  sounds: [],
});

export const db = {
  sounds: {
    list: () => _db.get('sounds').value(),
    get: ({ id }: Sound) => _db.get('sounds').find({ id }).value(),
    add: (sound: Sound) => _db.get('sounds').push(sound).write(),
    remove: ({ id }: Sound) =>
      _db
        .get('sounds')
        .remove((s) => s.id === id)
        .write(),
  },
};

type Sound = {
  name: string;
  id: string;
  extension: string;
  fileHash: string;
};

const splitFileName = (fileName: string) => {
  const FILENAME_REGEX = /(.*)\.([a-zA-Z0-9]+)/;
  const matches = fileName.match(FILENAME_REGEX);
  if (!matches || matches.length < 3) {
    console.error({ fileName, matches });
    throw new Error('Error while parsing filename');
  }
  const [, name, extension] = matches;
  return { name, extension };
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

export const filePath = (sound: Sound) =>
  `${Config.audioPath}/${sound.fileHash}.${sound.extension}`;
