export const USERS_MESSAGES = {
  VALIDATION_ERROR: 'Validation error',
  NAME_IS_REQUIRED: 'Name is required',
  NAME_MUST_BE_A_STRING: 'Name must be a string',
  NAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Name length must be from 1 to 100',
  EMAIL_ALREADY_EXISTS: 'Email already exists',
  EMAIL_IS_REQUIRED: 'Email is required',
  EMAIL_IS_INVALID: 'Email is invalid',
  EMAIL_OR_PASSWORD_IS_INCORRECT: 'Email or password is incorrect',
  PASSWORD_IS_REQUIRED: 'Password is required',
  PASSWORD_MUST_BE_A_STRING: 'Password must be a string',
  PASSWORD_MUST_BE_STRONG:
    'Password must be at least 6 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_IS_REQUIRED: 'Confirm password is required',
  CONFIRM_PASSWORD_MUST_BE_A_STRING: 'Confirm password must be a string',
  CONFIRM_PASSWORD_MUST_BE_STRONG:
    'Confirm password must be at least 6 characters long and contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol',
  CONFIRM_PASSWORD_MUST_BE_THE_SAME_AS_PASSWORD: 'Confirm password must be the same as password',
  DATE_OF_BIRTH_MUST_BE_ISO8601: 'Date of birth must be ISO8601',
  REGISTER_SUCCESSFULLY: 'Register successfully',
  LOGIN_SUCCESSFULLY: 'Login successfully',
  ACCESS_TOKEN_IS_REQUIRED: 'Access token is required',
  REFRESH_TOKEN_SUCCESSFULLY: 'Refresh token successfully',
  LOGOUT_SUCCESSFULLY: 'Logout successfully',
  REFRESH_TOKEN_IS_REQUIRED: 'Refresh token is required',
  REFRESH_TOKEN_IS_NOT_VALID: 'Refresh token is not valid',
  EMAIL_VERIFY_TOKEN_IS_REQUIRED: 'Email verify token is required',
  USER_NOT_FOUND: 'User not found',
  USER_ALREADY_VERIFIED: 'User already verified',
  VERIFY_EMAIL_SUCCESSFULLY: 'Verify email successfully',
  RESEND_VERIFY_EMAIL_SUCCESSFULLY: 'Resend verify email successfully',
  CHECK_YOUR_EMAIL_FOR_RESET_PASSWORD: 'Check your email for reset password',
  FORGOT_PASSWORD_TOKEN_IS_REQUIRED: 'Forgot password token is required',
  FORGOT_PASSWORD_TOKEN_IS_NOT_VALID: 'Forgot password token is not valid',
  VERIFY_FORGOT_PASSWORD_TOKEN_SUCCESSFULLY: 'Verify forgot password token successfully',
  RESET_PASSWORD_SUCCESSFULLY: 'Reset password successfully',
  GET_USER_SUCCESSFULLY: 'Get user successfully',
  USER_IS_NOT_VERIFIED: 'User is not verified',
  BIO_MUST_BE_A_STRING: 'Bio must be a string',
  BIO_LENGTH_MUST_BE_FROM_1_TO_300: 'Bio length must be from 1 to 300',
  LOCATION_MUST_BE_A_STRING: 'Location must be a string',
  LOCATION_LENGTH_MUST_BE_FROM_1_TO_100: 'Location length must be from 1 to 100',
  WEBSITE_MUST_BE_A_STRING: 'Website must be a string',
  WEBSITE_LENGTH_MUST_BE_FROM_1_TO_100: 'Website length must be from 1 to 100',
  USERNAME_MUST_BE_A_STRING: 'Username must be a string',
  USERNAME_LENGTH_MUST_BE_FROM_1_TO_100: 'Username length must be from 1 to 100',
  AVATAR_MUST_BE_A_URL: 'Avatar must be a URL',
  AVATAR_URL_LENGTH_MUST_BE_FROM_1_TO_200: 'Avatar url length must be from 1 to 200',
  COVER_PHOTO_MUST_BE_A_URL: 'Cover photo must be a URL',
  COVER_PHOTO_URL_LENGTH_MUST_BE_FROM_1_TO_200: 'Cover photo url length must be from 1 to 200',
  UPDATE_USER_FAILED: 'Update user failed',
  UPDATE_USER_SUCCESSFULLY: 'Update user successfully',
  YOU_NOT_UPDATE_ANYTHING: 'You not update anything',
  USERNAME_ALREADY_EXISTS: 'Username already exists',
  GET_PROFILE_SUCCESSFULLY: 'Get profile successfully',
  USER_ID_IS_NOT_VALID: 'User id is not valid',
  FOLLOWED: 'Followed',
  FOLLOWED_SUCCESSFULLY: 'Followed successfully',
  UNFOLLOWED: 'Unfollowed',
  UNFOLLOWED_SUCCESSFULLY: 'Unfollowed successfully',
  OLD_PASSWORD_INCORRECT: 'Old password incorrect',
  CHANGE_PASSWORD_SUCCESSFULLY: 'Change password successfully',
  GMAIL_NOT_VERIFIED: 'Gmail not verified',
  OAUTH_GOOGLE_SUCCESSFULLY: 'Oauth google successfully'
} as const

export const MEDIAS_MESSAGES = {
  UPLOAD_IMAGE_SUCCESSFULLY: 'Upload image successfully',
  REQUIRED_RANGE: 'Required range headers'
} as const

export const TWEET_MESSAGES = {
  INVALID_TWEET_TYPE: 'Invalid tweet type',
  INVALID_AUDIENCE_TYPE: 'Invalid audience type',
  PARENT_ID_MUST_BE_A_VALID_TWEET_ID: 'Parent id must be a valid tweet id',
  PARENT_ID_MUST_BE_NULL: 'Parent id must be null',
  CONTENT_MUST_NOT_BE_EMPTY: 'Content must not be empty',
  CONTENT_MUST_BE_EMPTY: 'Content must be empty',
  HASHTAGS_MUST_BE_STRING: 'Hashtags must be a string',
  MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID: 'Mentions must be an array of user ids',
  INVALID_MEDIA_TYPE: 'Invalid media type',
  MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECTS: 'Medias must be an array of media objects',
  CREATE_TWEET_SUCCESSFULLY: 'Create tweet successfully',
  INVALID_TWEET_ID: 'Invalid tweet id',
  TWEET_NOT_FOUND: 'Tweet not found'
} as const

export const BOOKMARKS_MESSAGES = {
  CREATE_BOOKMARK_SUCCESSFULLY: 'Bookmark successfully',
  DELETE_BOOKMARK_SUCCESSFULLY: 'Delete bookmark successfully'
} as const

export const LIKES_MESSAGES = {
  CREATE_LIKE_SUCCESSFULLY: 'Like successfully',
  DISLIKE_SUCCESSFULLY: 'Dislike successfully'
} as const
