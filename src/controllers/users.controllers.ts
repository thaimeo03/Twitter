import { NextFunction, Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import { USERS_MESSAGES } from '~/constants/messages'
import { RegisterReqBody } from '~/models/requests/user.requests'
import User from '~/models/schemas/User.schema'
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
  return res.json({ message: USERS_MESSAGES.LOGOUT_SUCCESSFULLY })
}
