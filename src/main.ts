
import dotenv from 'dotenv'
import express from 'express'
import {mumbleClient} from './mumbleService'
dotenv.config()

const app = express()
const port = process.env.PORT


app.get('/', (_, res) => {
  res.send('Hello World!')
})

app.get('/current-channel', (_, res) => {
  res.json(mumbleClient.getCurrentChannel())
})

app.get('/channels', (_, res) => {
  res.json(mumbleClient.getChannels())
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
