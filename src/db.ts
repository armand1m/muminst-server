import path from 'path';
import { omit } from 'ramda';
import low from 'lowdb';
import mkdirp from 'mkdirp';
import FileSync from 'lowdb/adapters/FileSync';
import { Sound } from './model/Sound';
import { Config } from './config';

console.log(`Creating "${Config.dbPath}" with "mkdir -p"`);
mkdirp.sync(Config.dbPath);
console.log(`Created ${Config.dbPath}`);

console.log(`Creating "${Config.audioPath}" with "mkdir -p"`);
mkdirp.sync(Config.audioPath);
console.log(`Created ${Config.audioPath}`);

const databaseFilePath = path.resolve(Config.dbPath, 'database.json');

const adapter = new FileSync(databaseFilePath);

interface State {
  sounds: Sound[];
}

const _db = low<low.AdapterSync<State>>(adapter);

_db
  .defaults<State>({ sounds: [] })
  .write();

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
