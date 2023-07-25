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
import Follower from '~/models/schemas/Follower.schema'
import axios from 'axios'
import 'dotenv/config'
import { ErrorWithStatus } from '~/models/Errors'
import { USERS_MESSAGES } from '~/constants/messages'
import HTTP_STATUS from '~/constants/httpStatus'
import { Request } from 'express'
import { sendVerifyEmail } from '~/utils/email'

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

  private signRefreshToken(user_id: string, verify: UserVerifyStatus, exp?: number) {
    return signToken({
      user_id,
      token_type: TokenTypes.RefreshToken,
      verify,
      exp: exp || Math.floor(Date.now() / 1000) + 100 * 24 * 60 * 60 // 100 days
    })
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
        username: `user-${_id.toString()}`,
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

    sendVerifyEmail(
      payload.email,
      'Verify your email',
      `<h1>Click 
       <a href=${process.env.URL_CLIENT}/verify-email?token=${email_verify_token} style="color: blue">here</a>
       to verify your email</h1>`
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

  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code'
    }

    const { data } = await axios.post('https://oauth2.googleapis.com/token', body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    })

    return data as {
      access_token: string
      id_token: string
    }
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: {
        Authorization: `Bearer ${id_token}`
      },
      params: {
        access_token,
        alt: 'json'
      }
    })
    return data as {
      id: string
      email: string
      verified_email: boolean
      name: string
      given_name: string
      family_name: string
      picture: string
      locale: string
    }
  }

  async oauthGoogle(code: string) {
    const token = await this.getOauthGoogleToken(code)
    const userInfo = await this.getGoogleUserInfo(token.access_token, token.id_token)

    // Not verified
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.FOBIDDEN
      })
    }

    // Email already exists
    const user = await databaseService.users.findOne({ email: userInfo.email })
    const user_id = user?._id || new ObjectId()
    if (!user) {
      await databaseService.users.insertOne(
        new User({
          _id: user_id,
          name: userInfo.name,
          email: userInfo.email,
          date_of_birth: new Date(),
          password: hashPassword(userInfo.email),
          verify: UserVerifyStatus.Verified,
          avatar: userInfo.picture,
          location: userInfo.locale,
          username: `user-${user_id.toString()}`
        })
      )
    }

    const [access_token, refresh_token] = await this.signAccessTokenAndRefreshToken(
      user_id.toString(),
      UserVerifyStatus.Verified
    )

    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )

    return { access_token, refresh_token }
  }

  async refreshToken(old_refresh_token: string, req: Request) {
    const { user_id, verify, exp } = req.decodeRefreshToken
    const refresh_token = await this.signRefreshToken(user_id as string, verify as UserVerifyStatus, exp as number)
    const [access_token] = await Promise.all([
      this.signAccessToken(user_id, verify as UserVerifyStatus),
      databaseService.refreshTokens.insertOne(
        new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
      ),
      databaseService.refreshTokens.deleteOne({ token: old_refresh_token })
    ])
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
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token })
    )
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
    const { twitter_circle, date_of_birth, ...rest } = payload
    const update = date_of_birth ? { ...rest, date_of_birth: new Date(date_of_birth) } : rest
    const twitter_circle_id = twitter_circle?.map((item: string) => new ObjectId(item))

    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: {
          ...update,
          twitter_circle: twitter_circle_id
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

  async getProfile(username: string) {
    const user = await databaseService.users.findOne(
      { username },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
          verify: 0,
          created_at: 0,
          updated_at: 0
        }
      }
    )
    return user
  }

  async follow(user_id: string, followed_user_id: string) {
    const followed = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (followed) {
      return followed
    }

    await databaseService.followers.insertOne(
      new Follower({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
    )
  }

  async unfollow(user_id: string, followed_user_id: string) {
    const followed = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id)
    })

    if (followed) {
      const result = await databaseService.followers.deleteOne({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id)
      })
      return result
    }

    return null
  }

  async getFollowedUsers(user_id: string) {
    const followers = await databaseService.followers.find({ user_id: new ObjectId(user_id) }).toArray()

    const followed_users_id = followers.map((item) => item.followed_user_id)
    followed_users_id.push(new ObjectId(user_id))

    return followed_users_id
  }

  async changePassword(user_id: string, password: string) {
    await databaseService.users.updateOne(
      {
        _id: new ObjectId(user_id)
      },
      {
        $set: { password: hashPassword(password) },
        $currentDate: {
          updated_at: true
        }
      }
    )
  }
}

const usersService = new UsersService()
export default usersService
