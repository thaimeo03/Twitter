import { Router } from 'express'
import { createTweetController, getTweetController } from '~/controllers/tweets.controllers'
import { createTweetValidator, tweetIdValidator } from '~/middlewares/tweet.middlewares'
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

// header?: access_token, params: tweet_id
tweetsRouter.get('/:tweet_id', tweetIdValidator, wrapRequestHandler(getTweetController))

export default tweetsRouter
