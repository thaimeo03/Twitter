import {
  ResendEmailVerificationController,
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  verifyEmailController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  verifyEmailValidator
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

// email_verify_token
usersRouter.post('/verify-email', verifyEmailValidator, wrapRequestHandler(verifyEmailController))

// header: access_token, body: none
usersRouter.post('/resend-verify-email', accessTokenValidator, wrapRequestHandler(ResendEmailVerificationController))

// email
usersRouter.post('/forgot-password', forgotPasswordValidator, wrapRequestHandler(forgotPasswordController))

export default usersRouter
