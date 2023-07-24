import { Router } from 'express'
import { searchContentController } from '~/controllers/search.controller'
import { searchValidator } from '~/middlewares/search.middlewares'
import { paginationValidator } from '~/middlewares/tweet.middlewares'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const searchRouter = Router()

// header: access_token, query: content, page, limit
searchRouter.get(
  '/',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  paginationValidator,
  searchValidator,
  wrapRequestHandler(searchContentController)
)

export default searchRouter
