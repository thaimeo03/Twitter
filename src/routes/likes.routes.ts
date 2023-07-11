import { Router } from 'express'
import { dislikeController, likeController } from '~/controllers/likes.controllers'
import { tweetIdValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const likeRouter = Router()

// header: access_token, body: tweet_id
likeRouter.post(
  '/create',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeController)
)

// header: access_token, params: tweet_id
likeRouter.delete(
  '/:tweet_id',
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(dislikeController)
)

export default likeRouter
