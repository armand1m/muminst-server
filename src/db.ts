import path from 'path';
import { omit } from 'ramda';
import low from 'lowdb';
import mkdirp from 'mkdirp';
import FileSync from 'lowdb/adapters/FileSync';
import { Sound } from './model/Sound';
import { Config } from './config';
import { logger } from './logger';

const { dbPath, audioPath } = Config.filesystem;

const dbLogger = logger.child({ source: 'database' });

dbLogger.info(`Creating "${dbPath}" with "mkdir -p"`);
mkdirp.sync(dbPath);
dbLogger.info(`Created ${dbPath}`);

dbLogger.info(`Creating "${audioPath}" with "mkdir -p"`);
mkdirp.sync(audioPath);
dbLogger.info(`Created ${audioPath}`);

const databaseFilePath = path.resolve(dbPath, 'database.json');

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

    getByFileHash: (fileHash: string) =>
      _db.get('sounds').find({ fileHash }).value(),

    add: (sound: Sound) => _db.get('sounds').push(sound).write(),

    remove: ({ id }: Sound) =>
      _db
        .get('sounds')
        .remove((s) => s.id === id)
        .write(),

    update: (id: string, sound: Sound) =>
      _db.get('sounds').find({ id }).assign(sound).value(),
  },
};
