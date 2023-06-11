import { Request } from 'express'
import { TokenTypes } from './constants/enums'

declare module 'express' {
  interface Request {
    user?: User
    decodeRefreshToken?: string | jwt.JwtPayload | undefined
    decodedAuthorization?: string | jwt.JwtPayload | undefined
  }
}
