import { Router } from 'express'
import { createTweetController } from '~/controllers/tweets.controllers'
import { createTweetValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const tweetsRouter = Router()

// header: access_token, body: tweetBody
tweetsRouter.post(
  '/create',
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController)
)

export default tweetsRouter
