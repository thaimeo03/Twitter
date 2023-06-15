import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody, UpdateUserBody } from '~/models/requests/user.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenTypes, UserVerifyStatus } from '~/constants/enums'
import {
  ACCESS_TOKEN_EXPIRES_IN,
  EMAIL_VERIFY_TOKEN_EXPIRES_IN,
  FORGOT_PASSWORD_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN
} from '~/constants/expires'
import { ObjectId } from 'mongodb'
import RefreshToken from '~/models/schemas/RefreshToken.schema'

class UsersService {
  async emailExists(email: string) {
    const result = await databaseService.users.findOne({ email })

    return Boolean(result)
  }

  private signAccessToken(user_id: string, verify: UserVerifyStatus) {
    return signToken(
      {
        user_id,
        token_type: TokenTypes.AccessToken,
        verify
      },
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    )
  }

  private signRefreshToken(user_id: string, verify: UserVerifyStatus) {
    return signToken(
      {
        user_id,
        token_type: TokenTypes.RefreshToken,
        verify
      },
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    )
  }

  private signEmailVerifyToken(user_id: string, verify: UserVerifyStatus) {
    return signToken(
      {
        user_id,
        token_type: TokenTypes.EmailVerifyToken,
        verify
      },
      { expiresIn: EMAIL_VERIFY_TOKEN_EXPIRES_IN }
    )
  }

  private signAccessTokenAndRefreshToken(user_id: string, verify: UserVerifyStatus) {
    return Promise.all([this.signAccessToken(user_id, verify), this.signRefreshToken(user_id, verify)])
  }

  private signForgotPasswordToken(user_id: string, verify: UserVerifyStatus) {
    return signToken(
      {
        user_id,
        token_type: TokenTypes.ForgotPasswordToken,
        verify
      },
      { expiresIn: FORGOT_PASSWORD_TOKEN_EXPIRES_IN }
    )
  }

  async register(payload: RegisterReqBody) {
    const _id = new ObjectId()
    const email_verify_token = await this.signEmailVerifyToken(_id.toString(), UserVerifyStatus.Unverified)
    const result = await databaseService.users.insertOne(
      new User({
        ...payload,
        _id,
        password: hashPassword(payload.password),
        date_of_birth: new Date(payload.date_of_birth),
        email_verify_token
      })
    )

    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(
      user_id,
      UserVerifyStatus.Unverified
    )

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )

    return { access_token, refresh_token }
  }

  async login(user_id: string, verify: UserVerifyStatus) {
    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(user_id, verify)
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
    return { access_token, refresh_token }
  }

  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token })
  }

  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessTokenAndRefreshToken(user_id, UserVerifyStatus.Verified),
      await databaseService.users.updateOne(
        { _id: new ObjectId(user_id) },
        { $set: { verify: UserVerifyStatus.Verified, email_verify_token: '' }, $currentDate: { updated_at: true } }
      )
    ])
    const [access_token, refresh_token] = token
    return { access_token, refresh_token }
  }

  async resendVerifyEmail(user_id: string) {
    const email_verify_token = await this.signEmailVerifyToken(user_id, UserVerifyStatus.Unverified)
    await databaseService.users.updateOne(
      { _id: new ObjectId(user_id) },
      { $set: { email_verify_token }, $currentDate: { updated_at: true } }
    )
  }

  async forgotPassword(user_id: string, verify: UserVerifyStatus) {
    const forgot_password_token = await this.signForgotPasswordToken(user_id, verify)
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: { forgot_password_token },
        $currentDate: { updated_at: true }
      }
    )
    console.log(forgot_password_token)
  }

  async resetPassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: { password: hashPassword(password), forgot_password_token: '' },
        $currentDate: { updated_at: true }
      }
    )
  }

  async getUser(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        }
      }
    )
    return user
  }

  async updateUser(user_id: string, payload: UpdateUserBody) {
    const { date_of_birth, ...rest } = payload
    const update = date_of_birth ? { ...rest, date_of_birth: new Date(date_of_birth) } : rest

    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...update
        },
        $currentDate: {
          updated_at: true
        }
      },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0
        },
        returnDocument: 'after'
      }
    )

    return user.value
  }
}

const usersService = new UsersService()
export default usersService
