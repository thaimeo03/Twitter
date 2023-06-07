import jwt from 'jsonwebtoken'

export const signToken = (payload: any, options?: jwt.SignOptions) => {
  const privateKey = process.env.JWT_SECRET as string
  const accessToken = jwt.sign(payload, privateKey, options)
  return Promise.resolve(accessToken)
}
