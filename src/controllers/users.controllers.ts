import { Request, Response } from 'express'
import { pick } from 'lodash'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { RegisterReqBody, UpdateUserBody } from '~/models/requests/user.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const verify = user.verify as UserVerifyStatus
  const result = await usersService.login(user_id.toString(), verify)
  return res.json({ message: USERS_MESSAGES.LOGIN_SUCCESSFULLY, result })
}

export const registerController = async (req: Request, res: Response) => {
  const result = await usersService.register(req.body as RegisterReqBody)
  return res.json({ message: USERS_MESSAGES.REGISTER_SUCCESSFULLY, result })
}

export const logoutController = async (req: Request, res: Response) => {
  await usersService.logout(req.body.refresh_token)
  return res.json({ message: USERS_MESSAGES.LOGOUT_SUCCESSFULLY })
}

export const verifyEmailController = async (req: Request, res: Response) => {
  const user_id = req.decodeEmailVerifyToken.user_id as string
  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: USERS_MESSAGES.USER_NOT_FOUND })
  }

  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({ message: USERS_MESSAGES.USER_ALREADY_VERIFIED })
  }

  const result = await usersService.verifyEmail(user_id)
  return res.json({ message: USERS_MESSAGES.VERIFY_EMAIL_SUCCESSFULLY, result })
}

export const ResendEmailVerificationController = async (req: Request, res: Response) => {
  const user_id = req.decodedAuthorization.user_id as string
  console.log(user_id)

  const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

  if (!user) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: USERS_MESSAGES.USER_NOT_FOUND })
  }

  if (user.verify === UserVerifyStatus.Verified && user.email_verify_token === '') {
    return res.json({ message: USERS_MESSAGES.USER_ALREADY_VERIFIED })
  }

  await usersService.resendVerifyEmail(user_id)
  return res.json({ message: USERS_MESSAGES.RESEND_VERIFY_EMAIL_SUCCESSFULLY })
}

export const forgotPasswordController = async (req: Request, res: Response) => {
  const user_id = req.user._id as ObjectId
  const verify = req.user.verify as UserVerifyStatus
  await usersService.forgotPassword(user_id.toString(), verify)

  return res.json({ message: USERS_MESSAGES.CHECK_YOUR_EMAIL_FOR_RESET_PASSWORD })
}

export const verifyForgotPasswordTokenController = async (req: Request, res: Response) => {
  return res.json({ message: USERS_MESSAGES.VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESSFULLY })
}

export const resetPasswordController = async (req: Request, res: Response) => {
  const user_id = req.decodeForgotPasswordToken.user_id as string
  const { password } = req.body
  await usersService.resetPassword(user_id, password as string)
  res.json({ message: USERS_MESSAGES.RESET_PASSWORD_SUCCESSFULLY })
}

export const getUserController = async (req: Request, res: Response) => {
  const user_id = req.decodedAuthorization.user_id as string
  const user = await usersService.getUser(user_id)

  if (user === null) {
    return res.status(HTTP_STATUS.NOT_FOUND).json({ message: USERS_MESSAGES.USER_NOT_FOUND })
  }

  return res.json({ message: USERS_MESSAGES.GET_USER_SUCCESSFULLY, result: user })
}

export const updateUserController = async (req: Request, res: Response) => {
  const payload = pick(req.body, [
    'name',
    'date_of_birth',
    'bio',
    'location',
    'website',
    'username',
    'avatar',
    'cover_photo'
  ]) as UpdateUserBody

  if (Object.keys(payload).length === 0) {
    return res.json({ message: USERS_MESSAGES.YOU_NOT_UPDATE_ANYTHING })
  }

  const user_id = req.decodedAuthorization.user_id as string

  const user = await usersService.updateUser(user_id, payload)
  if (user === null) {
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: USERS_MESSAGES.UPDATE_USER_FAILED })
  }

  return res.json({ message: USERS_MESSAGES.UPDATE_USER_SUCCESSFULLY, result: user })
}
