import { Request, Response } from 'express'

export const createTweetController = async (req: Request, res: Response) => {
  res.json({ message: 'OK' })
}
