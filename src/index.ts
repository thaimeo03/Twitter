import express from 'express'
import usersRouter from './routes/users.routes'
import databaseService from './services/database.services'
import { defaultErrorHandler } from './middlewares/error.middlewares'
import mediasRouter from './routes/medias.routes'
import { initUploadFile } from './utils/file'
import 'dotenv/config'
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR } from './constants/dir'
import cors from 'cors'
import tweetsRouter from './routes/tweets.routes'
import bookmarksRouter from './routes/bookmarks.routes'
import likeRouter from './routes/likes.routes'
import searchRouter from './routes/search.routes'

const app = express()
const port = process.env.PORT || 4000
databaseService.connect()

// Init upload file if not exist
initUploadFile()

app.use(cors())
app.use(express.json())
app.use('/users', usersRouter)
app.use('/medias', mediasRouter)
app.use('/tweets', tweetsRouter)
app.use('/search', searchRouter)
app.use('/bookmarks', bookmarksRouter)
app.use('/likes', likeRouter)
app.use(defaultErrorHandler)

app.use('/static/image', express.static(UPLOAD_IMAGE_DIR))
app.use('/static/video', express.static(UPLOAD_VIDEO_DIR))

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
