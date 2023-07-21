import { Router } from 'express'
import {
  createTweetController,
  getNewFeedsController,
  getTweetChildrenController,
  getTweetController
} from '~/controllers/tweets.controllers'
import {
  audienceValidator,
  createTweetValidator,
  getTweetChildrenValidator,
  paginationValidator,
  tweetIdValidator
} from '~/middlewares/tweet.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
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
tweetsRouter.get(
  '/:tweet_id',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController)
)

// header?: access_token, query: page, limit
tweetsRouter.get(
  '/:tweet_id/children',
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  getTweetChildrenValidator,
  paginationValidator,
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController)
)

// header?: access_token, params: tweet_id, query: tweet_type, page, limit
tweetsRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  wrapRequestHandler(getNewFeedsController)
)

export default tweetsRouter
