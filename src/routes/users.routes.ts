import {
  ResendEmailVerificationController,
  changePasswordController,
  followUserController,
  forgotPasswordController,
  getProfileController,
  getUserController,
  loginController,
  logoutController,
  oauthGoogleController,
  registerController,
  resetPasswordController,
  unfollowUserController,
  updateUserController,
  verifyEmailController,
  verifyForgotPasswordTokenController
} from '~/controllers/users.controllers'
import {
  accessTokenValidator,
  changePasswordValidator,
  followerValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unfollowerValidator,
  updateUserValidator,
  verifiedUserValidator,
  verifyEmailValidator,
  verifyForgotPasswordTokenValidator
} from '~/middlewares/users.middlewares'
import { Router } from 'express'
import { wrapRequestHandler } from '~/utils/handler'
import { UpdateUserBody } from '~/models/requests/user.requests'
import { sanitizeData } from '~/middlewares/common.middlewares'

const usersRouter = Router()

// email, password
usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

// oauth 2.0 google
usersRouter.get('/oauth/google', wrapRequestHandler(oauthGoogleController))

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

// forgot_password_token
usersRouter.post(
  '/verify-forgot-password',
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordTokenController)
)

// password, confirm_password, forgot_password_token
usersRouter.post('/reset-password', resetPasswordValidator, wrapRequestHandler(resetPasswordController))

// header: access_token
usersRouter.get('/me', accessTokenValidator, wrapRequestHandler(getUserController))

// header: access_token, body: userSchema
usersRouter.patch(
  '/me',
  accessTokenValidator,
  verifiedUserValidator,
  updateUserValidator,
  sanitizeData<UpdateUserBody>([
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]),
  wrapRequestHandler(updateUserController)
)

usersRouter.get('/:username', wrapRequestHandler(getProfileController))

// header: access_token, body: followed_user_id
usersRouter.post(
  '/follow',
  accessTokenValidator,
  verifiedUserValidator,
  followerValidator,
  wrapRequestHandler(followUserController)
)

// header: access_token, params: user_id
usersRouter.delete(
  '/follow/:user_id',
  accessTokenValidator,
  verifiedUserValidator,
  unfollowerValidator,
  wrapRequestHandler(unfollowUserController)
)

// header: access_token, body: old_password, password, confirm_password
usersRouter.put(
  '/change-password',
  accessTokenValidator,
  changePasswordValidator,
  wrapRequestHandler(changePasswordController)
)

export default usersRouter
