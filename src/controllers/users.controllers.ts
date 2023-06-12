import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { RegisterReqBody } from '~/models/requests/user.requests'
import User from '~/models/schemas/User.schema'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'

export const loginController = async (req: Request, res: Response) => {
  const user = req.user as User
  const user_id = user._id as ObjectId
  const result = await usersService.login(user_id.toString())
  return res.json({ message: USERS_MESSAGES.LOGIN_SUCCESSFULLY, result })
}

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
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
