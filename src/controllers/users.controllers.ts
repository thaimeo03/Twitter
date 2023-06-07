import { Request, Response } from 'express'
import { RegisterReqBody } from '~/models/requests/user.requests'
import usersService from '~/services/users.services'

export const loginController = (req: Request, res: Response) => {
  return res.json({ message: 'Login successfully' })
}

export const registerController = async (req: Request, res: Response) => {
  try {
    const result = await usersService.register(req.body as RegisterReqBody)
    return res.json({ message: 'Register successfully', result })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ message: 'Register failed' })
  }
}
