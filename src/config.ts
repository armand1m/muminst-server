require('dotenv').config();
import * as yup from 'yup';

const createRequiredErrMessage = (envVar: string) =>
  `${envVar} environment variable is required.`;

const schema = yup.object({
  hostname: yup
    .string()
    .required(createRequiredErrMessage('HOSTNAME')),
  port: yup.number().required(createRequiredErrMessage('PORT')),
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
    audioPath: process.env.AUDIO_PATH,
    mumbleUrl: process.env.MUMBLE_URL,
    mumbleUserName: process.env.NAME,
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
