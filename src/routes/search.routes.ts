import { Router } from 'express'
import { searchContentController } from '~/controllers/search.controller'
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from '~/middlewares/users.middlewares'
import { wrapRequestHandler } from '~/utils/handler'

const searchRouter = Router()

// header: access_token, query: content, page, limit
searchRouter.get(
  '/',
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  wrapRequestHandler(searchContentController)
)

export default searchRouter
