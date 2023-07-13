import { Request } from 'express'
import { TokenTypes } from './constants/enums'
import Tweet from './models/schemas/Twitter.schema'

declare module 'express' {
  interface Request {
    user?: User
    decodeRefreshToken?: string | jwt.JwtPayload | undefined
    decodedAuthorization?: string | jwt.JwtPayload | undefined
    decodeEmailVerifyToken?: string | jwt.JwtPayload | undefined
    decodeForgotPasswordToken?: string | jwt.JwtPayload | undefined
    tweet?: Tweet
  }
}
