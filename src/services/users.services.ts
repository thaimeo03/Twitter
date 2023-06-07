import User from '~/models/schemas/User.schema'
import databaseService from './database.services'
import { RegisterReqBody } from '~/models/requests/user.requests'
import { hashPassword } from '~/utils/crypto'
import { signToken } from '~/utils/jwt'
import { TokenTypes } from '~/constants/enums'
import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } from '~/constants/expires'

class UsersService {
  private signAccessToken(user_id: string) {
    return signToken(
      {
        user_id,
        token_type: TokenTypes.AccessToken
      },
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    )
  }

  private signRefreshToken(user_id: string) {
    return signToken(
      {
        user_id,
        token_type: TokenTypes.RefreshToken
      },
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    )
  }

  async register(payload: RegisterReqBody) {
    const result = await databaseService.users.insertOne(
      new User({ ...payload, date_of_birth: new Date(payload.date_of_birth), password: hashPassword(payload.password) })
    )

    const user_id = result.insertedId.toString()
    const [access_token, refresh_token] = await Promise.all([
      this.signAccessToken(user_id),
      this.signRefreshToken(user_id)
    ])

    return { access_token, refresh_token }
  }

  async emailExists(email: string) {
    const result = await databaseService.users.findOne({ email })

    return Boolean(result)
  }
}

const usersService = new UsersService()
export default usersService
