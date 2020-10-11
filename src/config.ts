require('dotenv').config();
import * as yup from 'yup';

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

const schema = yup.object({
  hostname: yup
    .string()
    .required(createRequiredErrMessage('HOSTNAME')),
  port: yup.number().required(createRequiredErrMessage('PORT')),
  proto: yup
    .string()
    .oneOf(['http', 'https'])
    .required(createRequiredErrMessage('PROTO', ['http', 'https'])),
  dbPath: yup.string().required(createRequiredErrMessage('DB_PATH')),
  audioPath: yup
    .string()
    .required(createRequiredErrMessage('AUDIO_PATH')),
  mumbleUrl: yup
    .string()
    .required(createRequiredErrMessage('MUMBLE_URL')),
  mumbleUserName: yup
    .string()
    .required(createRequiredErrMessage('MUMBLE_USERNAME')),
});

const createConfig = () => {
  const config = {
    hostname: process.env.HOSTNAME ?? '0.0.0.0',
    port: Number(process.env.PORT) ?? 4000,
    proto: process.env.PROTO,
    dbPath: process.env.DB_PATH,
    audioPath: process.env.AUDIO_PATH,
    mumbleUrl: process.env.MUMBLE_URL,
    mumbleUserName: process.env.MUMBLE_USERNAME,
  };

  try {
    const validatedConfig = schema.validateSync(config);

    if (!validatedConfig) {
      throw new Error(
        'Failed to validate environment configuration.'
      );
    }

    return validatedConfig;
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

export const Config = createConfig();
