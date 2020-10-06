import fs from 'fs'

const audioPath = process.env.AUDIO_PATH || ''

const filterFormat = (files: string[]) =>
    files.filter((file) => file.match(/\.(?:wav|mp3)$/i))

const listSounds = async () =>
    filterFormat(
        await fs.promises.readdir(audioPath, {})
    )

export const fileService = {
    listSounds,
}
