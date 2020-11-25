require('dotenv').config();
import * as yup from 'yup';
import { LockStore } from './stores/LockStore';

const createRequiredErrMessage = (
  envVar: string,
  possibleValues?: string[]
) => {
  const initialMessage = `${envVar} environment variable is required.`;

  if (!possibleValues || possibleValues.length === 0) {
    return initialMessage;
  }

  return `${initialMessage} Use one of the possible values: ${possibleValues.join(
    ', '
  )}`;
};

export type SupportedChatClient = 'mumble' | 'discord' | 'telegram';

export interface MumbleProperties {
  url: string;
  username: string;
  lockStore: LockStore;
}

export interface DiscordProperties {
  token: string;
  lockStore: LockStore;
}

export interface TelegramProperties {
  token: string;
  chatId: string;
  lockStore: LockStore;
}

const schema = yup.object({
  metadata: yup
    .object({
      hostname: yup
        .string()
        .required(createRequiredErrMessage('HOSTNAME')),
      port: yup.number().required(createRequiredErrMessage('PORT')),
      proto: yup
        .string()
        .oneOf(['http', 'https'])
        .required(
          createRequiredErrMessage('PROTO', ['http', 'https'])
        ),
    })
    .required(),
  filesystem: yup
    .object({
      dbPath: yup
        .string()
        .required(createRequiredErrMessage('DB_PATH')),
      audioPath: yup
        .string()
        .required(createRequiredErrMessage('AUDIO_PATH')),
    })
    .required(),
  features: yup
    .object({
      mumble: yup
        .boolean()
        .required(
          createRequiredErrMessage('MUMBLE_ENABLED', [
            'true',
            'false',
          ])
        ),
      discord: yup
        .boolean()
        .required(
          createRequiredErrMessage('DISCORD_ENABLED', [
            'true',
            'false',
          ])
        ),
      telegram: yup
        .boolean()
        .required(
          createRequiredErrMessage('TELEGRAM_ENABLED', [
            'true',
            'false',
          ])
        ),
    })
    .required(),
  mumble: yup
    .object<MumbleProperties>()
    .when('features.mumble', {
      is: true,
      then: yup
        .object({
          url: yup
            .string()
            .required(createRequiredErrMessage('MUMBLE_URL')),
          username: yup
            .string()
            .required(createRequiredErrMessage('MUMBLE_USERNAME')),
        })
        .required(),
      otherwise: yup.object().optional(),
    })
    .required(),
  discord: yup
    .object<DiscordProperties>()
    .when('features.discord', {
      is: true,
      then: yup
        .object({
          token: yup
            .string()
            .required(createRequiredErrMessage('DISCORD_BOT_TOKEN')),
        })
        .required(),
      otherwise: yup.object().optional(),
    })
    .required(),
  telegram: yup
    .object<TelegramProperties>()
    .when('features.telegram', {
      is: true,
      then: yup
        .object({
          token: yup
            .string()
            .required(createRequiredErrMessage('TELEGRAM_BOT_TOKEN')),
          chatId: yup
            .string()
            .required(createRequiredErrMessage('TELEGRAM_CHAT_ID')),
        })
        .required(),
      otherwise: yup.object().optional(),
    })
    .required(),
});

const createConfig = () => {
  const unsafeConfig = {
    metadata: {
      hostname: process.env.HOSTNAME ?? '0.0.0.0',
      port: Number(process.env.PORT) ?? 4000,
      proto: process.env.PROTO,
    },
    filesystem: {
      dbPath: process.env.DB_PATH,
      audioPath: process.env.AUDIO_PATH,
    },
    features: {
      mumble: process.env.MUMBLE_ENABLED === 'true',
      discord: process.env.DISCORD_ENABLED === 'true',
      telegram: process.env.TELEGRAM_ENABLED === 'true',
    },
    mumble: {
      url: process.env.MUMBLE_URL,
      username: process.env.MUMBLE_USERNAME,
    },
    discord: {
      token: process.env.DISCORD_BOT_TOKEN,
    },
    telegram: {
      token: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID,
    },
  };

  try {
    const config = schema.validateSync(unsafeConfig);

    if (!config) {
      throw new Error(
        'Failed to validate environment configuration.'
      );
    }

    return config;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export const Config = createConfig();

export type ConfigInterface = typeof Config;
