import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initUploadFile } from './utils/file'
import 'dotenv/config'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'

const app = express()
const port = process.env.PORT || 4000
databaseService.connect()

// Init upload file if not exist
initUploadFile()

app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use(defaultErrorHandler)

app.use('/static/image', express.static(UPLOAD_IMAGE_DIR))
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
