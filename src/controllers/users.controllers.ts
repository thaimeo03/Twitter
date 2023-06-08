import { NextFunction, Request, Response } from 'express'
import { RegisterReqBody } from '~/models/requests/user.requests'
import usersService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
  return res.json({ message: 'Login successfully' })
}

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  const result = await usersService.register(req.body as RegisterReqBody)
  return res.json({ message: 'Register successfully', result })
}
