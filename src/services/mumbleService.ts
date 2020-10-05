require('dotenv').config()
const NoodleJS = require('noodle.js')

const client = new NoodleJS({
    url: process.env.MUMBLE_URL,
    name: process.env.NAME,
})

client.connect()

export const mumbleClient = {
    getChannels: () => client.channels.array(),
    getCurrentChannel: () => client.user.channel,
    playSong: (path: string) => client.voiceConnection.playFile(path),
    stop: client.voiceConnection.stop,
    setVolume: client.voiceConnection.setVolume,
}
