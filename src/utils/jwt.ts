import jwt from 'jsonwebtoken'

export const signToken = (payload: any, options?: jwt.SignOptions) => {
  const privateKey = process.env.JWT_SECRET as string
  const accessToken = jwt.sign(payload, privateKey, options)
  return Promise.resolve(accessToken)
}

export const verifyToken = (token: string) => {
  const privateKey = process.env.JWT_SECRET as string
  return new Promise((resolve, reject) => {
    jwt.verify(token, privateKey, (err, decoded) => {
      if (err) {
        return reject(err)
      }
      return resolve(decoded)
    })
  })
}
