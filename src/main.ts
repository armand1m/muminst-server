import dotenv from 'dotenv'
import express, { Request } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { fileService } from './services/fileService'
import { mumbleClient } from './services/mumbleService'

dotenv.config()

const port = process.env.PORT
const corsOptions = {
    origin: 'http://localhost.com:3000',
    optionsSuccessStatus: 200,
}

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.get('/channels', (_, res) => {
    res.json(mumbleClient.getChannels())
})

app.get('/sounds', async (_, res) => {
    try {
        const sounds = await fileService.listSounds()
        res.json(sounds)
    } catch (err) {
        res.json({ err })
    }
})

app.post(
    '/play-sound',
    async (req: Request<{}, {}, { soundName: string }>, res) => {
        try {
            if (
                !(await fileService.listSounds()).includes(req.body.soundName)
            ) {
                throw 'File not found'
            }
            mumbleClient.playSong(
                `${process.env.AUDIO_PATH}/${req.body.soundName}`
            )
            res.json({ audio: true })
        } catch (err) {
            console.log(err)
            res.status(500).json({ message: 'Problem', error: err })
        }
    }
)

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
