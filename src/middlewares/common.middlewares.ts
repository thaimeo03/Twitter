import { NextFunction, Request, Response } from 'express'
import { pick } from 'lodash'

type keyOfData<T> = Array<keyof T>

export const sanitizeData =
  <T>(data: keyOfData<T>) =>
  (req: Request, res: Response, next: NextFunction) => {
    req.body = pick(req.body, data)
    next()
  }
