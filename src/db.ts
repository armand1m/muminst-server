import low from 'lowdb';
import FileSync from 'lowdb/adapters/FileSync';
import R from 'ramda';
import { Sound } from './model/Sound';

const adapter = new FileSync('./data/db.json');

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
        .map(R.omit(['fileHash']))
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
