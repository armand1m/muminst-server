import fs from 'fs'

const audioPath = process.env.AUDIO_PATH || ''

console.log(audioPath)

const filterFormat = (files: string[]) =>
    files.filter((file) => file.match(/\.(?:wav|mp3)$/i))

const listSounds = async () =>
    filterFormat(
        await fs.promises.readdir(
            '/home/roboto/Codes/mumblebot/muminst-server/src/audio',
            {}
        )
    )

export const fileService = {
    listSounds,
}
