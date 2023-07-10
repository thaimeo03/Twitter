import { Router } from 'express'
import { createBookmarkController, deleteBookmarkController } from '~/controllers/bookmarks.controllers'
import { tweetIdValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const bookmarksRouter = Router()

// header: access_token, body: tweet_id
bookmarksRouter.post(
  '/create',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(createBookmarkController)
)

// header: access_token, params: tweet_id
bookmarksRouter.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(deleteBookmarkController)
)

export default bookmarksRouter
