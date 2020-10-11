import path from 'path';
import { omit } from 'ramda';
import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import { Sound } from './model/Sound';
import { Config } from './config';

const databaseFilePath = path.resolve(Config.audioPath, 'db.json');

const adapter = new FileSync(databaseFilePath);

type State = {
  sounds: Sound[];
};

const _db = low<low.AdapterSync<State>>(adapter);

_db.defaults<State>({ sounds: [] });

export const db = {
  sounds: {
    list: () =>
      _db
        .get('sounds')
        .map(omit(['fileHash']))
        .value(),

    get: (id: string) => _db.get('sounds').find({ id }).value(),

    add: (sound: Sound) => _db.get('sounds').push(sound).write(),

    remove: ({ id }: Sound) =>
      _db
        .get('sounds')
        .remove((s) => s.id === id)
        .write(),
  },
};
