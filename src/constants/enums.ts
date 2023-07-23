export enum UserVerifyStatus {
  Unverified, // chưa xác thực email, mặc định = 0
  Verified, // đã xác thực email
  Banned // bị khóa
}

export enum TokenTypes {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video
}

export enum MediaQuery {
  Image = 'image',
  Video = 'video'
}

export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}

export enum TweetAudience {
  Everyone,
  TwitterCircle
}
