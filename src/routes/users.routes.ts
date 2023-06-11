import { loginController, logoutController, registerController } from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator
} from '~/middlewares/users.middlewares'
import { Router } from 'express'
import { wrapRequestHandler } from '~/utils/handler'

const usersRouter = Router()

// email, password
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

// name, email, password, confirm_password, date_of_birth
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

// header: access_token, body: refresh_token
usersRouter.post('/logout', accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController))

export default usersRouter
