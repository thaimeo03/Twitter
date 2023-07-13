import { NextFunction, Request, Response } from 'express'
import { ParamSchema, checkSchema } from 'express-validator'
import { JwtPayload } from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { UserVerifyStatus } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { USERS_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import usersService from '~/services/users.services'
import { hashPassword } from '~/utils/crypto'
import { verifyToken } from '~/utils/jwt'
import { validate } from '~/utils/validate'

const schemaPassword: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isStrongPassword: {
    options: {
      minLength: 6
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  }
}

const schemaConfirmPassword: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
  },
  isString: {
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
  },
  isStrongPassword: {
    options: {
      minLength: 6
    },
    errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
  },
  custom: {
    options: (value, { req }) => {
      if (value !== req.body.password) {
        throw new Error(USERS_MESSAGES.CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD)
      }
      return true
    }
  }
}

const schemaForgotPasswordToken: ParamSchema = {
  notEmpty: {
    errorMessage: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_REQUIRED
  },
  custom: {
    options: async (value, { req }) => {
      const forgot_password_token = value as string
      const decodeForgotPasswordToken = (await verifyToken(forgot_password_token)) as JwtPayload
      const user_id = decodeForgotPasswordToken.user_id as string
      const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })

      if (user === null) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }

      if (user.forgot_password_token !== forgot_password_token) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.FORGOT_PASSWORD_TOKEN_IS_NOT_VALID,
          status: HTTP_STATUS.UNAUTHORIZED
        })
      }
      req.decodeForgotPasswordToken = decodeForgotPasswordToken

      return true
    }
  }
}

const schemaFollower: ParamSchema = {
  custom: {
    options: async (value) => {
      const followed_user_id = value as string
      if (!ObjectId.isValid(followed_user_id)) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_ID_IS_NOT_VALID,
          status: HTTP_STATUS.BAD_REQUEST
        })
      }
      const follower = await databaseService.users.findOne({ _id: new ObjectId(followed_user_id) })
      if (follower === null) {
        throw new ErrorWithStatus({
          message: USERS_MESSAGES.USER_NOT_FOUND,
          status: HTTP_STATUS.NOT_FOUND
        })
      }
    }
  }
}

////////////

export const loginValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({
              email: value,
              password: hashPassword(req.body.password)
            })
            if (user === null) {
              throw new Error(USERS_MESSAGES.EMAIL_OR_PASSWORD_IS_INCORRECT)
            }
            req.user = user
            return true
          }
        }
      },
      password: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.PASSWORD_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_A_STRING
        },
        isStrongPassword: {
          options: {
            minLength: 6
          },
          errorMessage: USERS_MESSAGES.PASSWORD_MUST_BE_STRONG
        }
      }
    },
    ['body']
  )
)

export const registerValidator = validate(
  checkSchema(
    {
      name: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.NAME_IS_REQUIRED
        },
        isString: {
          errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
        },
        trim: true
      },
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value) => {
            const isExists = await usersService.emailExists(value)
            if (isExists) {
              throw new Error(USERS_MESSAGES.EMAIL_ALREADY_EXISTS)
            }
            return true
          }
        }
      },
      password: schemaPassword,
      confirm_password: schemaConfirmPassword,
      date_of_birth: {
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
        }
      }
    },
    ['body']
  )
)

export const accessTokenValidator = validate(
  checkSchema(
    {
      Authorization: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const access_token = value.split(' ')[1]

            if (access_token === undefined) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.ACCESS_TOKEN_IS_REQUIRED,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            const decodedAuthorization = await verifyToken(access_token)
            req.decodedAuthorization = decodedAuthorization
            return true
          }
        }
      }
    },
    ['headers']
  )
)

export const refreshTokenValidator = validate(
  checkSchema(
    {
      refresh_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.REFRESH_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const refresh_token = value
            const [decodeRefreshToken, result] = await Promise.all([
              verifyToken(refresh_token),
              databaseService.refreshTokens.findOne({ token: refresh_token })
            ])
            if (result === null) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.REFRESH_TOKEN_IS_NOT_VALID,
                status: HTTP_STATUS.UNAUTHORIZED
              })
            }
            req.decodeRefreshToken = decodeRefreshToken
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyEmailValidator = validate(
  checkSchema(
    {
      email_verify_token: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_VERIFY_TOKEN_IS_REQUIRED
        },
        custom: {
          options: async (value, { req }) => {
            const email_verify_token = value
            const decodeEmailVerifyToken = await verifyToken(email_verify_token)
            req.decodeEmailVerifyToken = decodeEmailVerifyToken
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const forgotPasswordValidator = validate(
  checkSchema(
    {
      email: {
        notEmpty: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_REQUIRED
        },
        isEmail: {
          errorMessage: USERS_MESSAGES.EMAIL_IS_INVALID
        },
        trim: true,
        custom: {
          options: async (value, { req }) => {
            const user = await databaseService.users.findOne({ email: value })
            if (user === null) {
              throw new Error(USERS_MESSAGES.USER_NOT_FOUND)
            }
            req.user = user
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const verifyForgotPasswordTokenValidator = validate(
  checkSchema(
    {
      forgot_password_token: schemaForgotPasswordToken
    },
    ['body']
  )
)

export const resetPasswordValidator = validate(
  checkSchema(
    {
      password: schemaPassword,
      confirm_password: schemaConfirmPassword,
      forgot_password_token: schemaForgotPasswordToken
    },
    ['body']
  )
)

export const verifiedUserValidator = async (req: Request, res: Response, next: NextFunction) => {
  const verify = req.decodedAuthorization.verify as UserVerifyStatus
  if (verify !== UserVerifyStatus.Verified) {
    next(
      new ErrorWithStatus({
        message: USERS_MESSAGES.USER_IS_NOT_VERIFIED,
        status: HTTP_STATUS.FOBIDDEN
      })
    )
  }
  next()
}

export const updateUserValidator = validate(
  checkSchema(
    {
      name: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.NAME_MUST_BE_A_STRING
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: USERS_MESSAGES.NAME_LENGTH_MUST_BE_FROM_1_TO_100
        },
        trim: true
      },
      date_of_birth: {
        optional: true,
        isISO8601: {
          options: {
            strict: true,
            strictSeparator: true
          },
          errorMessage: USERS_MESSAGES.DATE_OF_BIRTH_MUST_BE_ISO8601
        }
      },
      bio: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.BIO_MUST_BE_A_STRING
        },
        isLength: {
          options: { min: 1, max: 300 },
          errorMessage: USERS_MESSAGES.BIO_LENGTH_MUST_BE_FROM_1_TO_300
        },
        trim: true
      },
      location: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.LOCATION_MUST_BE_A_STRING
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: USERS_MESSAGES.LOCATION_LENGTH_MUST_BE_FROM_1_TO_100
        },
        trim: true
      },
      website: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.WEBSITE_MUST_BE_A_STRING
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: USERS_MESSAGES.WEBSITE_LENGTH_MUST_BE_FROM_1_TO_100
        },
        trim: true
      },
      username: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.USERNAME_MUST_BE_A_STRING
        },
        isLength: {
          options: { min: 1, max: 100 },
          errorMessage: USERS_MESSAGES.USERNAME_LENGTH_MUST_BE_FROM_1_TO_100
        },
        custom: {
          options: async (value) => {
            const username = value
            const user = await databaseService.users.findOne({ username })
            if (user) {
              throw new ErrorWithStatus({
                message: USERS_MESSAGES.USERNAME_ALREADY_EXISTS,
                status: HTTP_STATUS.BAD_REQUEST
              })
            }
            return true
          }
        },
        trim: true
      },
      avatar: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.AVATAR_MUST_BE_A_URL
        },
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: USERS_MESSAGES.AVATAR_URL_LENGTH_MUST_BE_FROM_1_TO_200
        },
        trim: true
      },
      cover_photo: {
        optional: true,
        isString: {
          errorMessage: USERS_MESSAGES.COVER_PHOTO_MUST_BE_A_URL
        },
        isLength: {
          options: { min: 1, max: 200 },
          errorMessage: USERS_MESSAGES.COVER_PHOTO_URL_LENGTH_MUST_BE_FROM_1_TO_200
        },
        trim: true
      }
    },
    ['body']
  )
)

export const followerValidator = validate(
  checkSchema(
    {
      followed_user_id: schemaFollower
    },
    ['body']
  )
)

export const unfollowerValidator = validate(
  checkSchema(
    {
      user_id: schemaFollower
    },
    ['params']
  )
)

export const changePasswordValidator = validate(
  checkSchema({
    old_password: {
      ...schemaPassword,
      custom: {
        options: async (value, { req }) => {
          const old_password = value as string
          const user_id = req.decodedAuthorization.user_id as string

          const user = await databaseService.users.findOne({ _id: new ObjectId(user_id) })
          if (!user) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.USER_NOT_FOUND,
              status: HTTP_STATUS.NOT_FOUND
            })
          }
          const isMatchPassword = hashPassword(old_password) === user.password
          if (!isMatchPassword) {
            throw new ErrorWithStatus({
              message: USERS_MESSAGES.OLD_PASSWORD_INCORRECT,
              status: HTTP_STATUS.BAD_REQUEST
            })
          }
          return true
        }
      }
    },
    password: schemaPassword,
    confirm_password: schemaConfirmPassword
  })
)

export const isUserLoggedInValidator = (middlewareFunc: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.headers.authorization) {
      return middlewareFunc(req, res, next)
    }
    next()
  }
}
