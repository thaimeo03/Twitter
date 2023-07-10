import { checkSchema } from 'express-validator'
import { isEmpty } from 'lodash'
import { ObjectId } from 'mongodb'
import { MediaType, TweetAudience, TweetType } from '~/constants/enums'
import HTTP_STATUS from '~/constants/httpStatus'
import { TWEET_MESSAGES } from '~/constants/messages'
import { ErrorWithStatus } from '~/models/Errors'
import databaseService from '~/services/database.services'
import { numberEnumToArray } from '~/utils/common'
import { validate } from '~/utils/validate'

const tweetTypes = numberEnumToArray(TweetType)
const tweetAudienceTypes = numberEnumToArray(TweetAudience)
const mediaTypes = numberEnumToArray(MediaType)

export const createTweetValidator = validate(
  checkSchema(
    {
      type: {
        isIn: {
          options: [tweetTypes],
          errorMessage: TWEET_MESSAGES.INVALID_TWEET_TYPE
        }
      },
      audience: {
        isIn: {
          options: [tweetAudienceTypes],
          errorMessage: TWEET_MESSAGES.INVALID_AUDIENCE_TYPE
        }
      },
      parent_id: {
        custom: {
          options: (value, { req }) => {
            const tweetType = req.body.type as TweetType
            // If tweet type is retweet, comment, quoteTweet -> parent_id is tweet_id of parent tweet
            if (
              [TweetType.Retweet, TweetType.Comment, TweetType.QuoteTweet].includes(tweetType) &&
              !ObjectId.isValid(value)
            ) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEET_MESSAGES.PARENT_ID_MUST_BE_A_VALID_TWEET_ID
              })
            }
            // If tweet type is tweet -> parent_id is null
            if (tweetType === TweetType.Tweet && value !== null) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEET_MESSAGES.PARENT_ID_MUST_BE_NULL
              })
            }
            return true
          }
        }
      },
      content: {
        isString: true,
        custom: {
          options: (value, { req }) => {
            const tweetType = req.body.type as TweetType
            const hashTags = req.body.hashtags as string[]
            const mentions = req.body.mentions as string[]

            // If tweet type is comment, quoteTweet, tweet and not have hashtags and mentions -> content is string and not empty
            if (
              [TweetType.Comment, TweetType.QuoteTweet, TweetType.Tweet].includes(tweetType) &&
              isEmpty(hashTags) &&
              isEmpty(mentions) &&
              value === ''
            ) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEET_MESSAGES.CONTENT_MUST_NOT_BE_EMPTY
              })
            }

            // If tweet type is retweet -> content is ''
            if (tweetType === TweetType.Retweet && value !== '') {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEET_MESSAGES.CONTENT_MUST_BE_EMPTY
              })
            }
            return true
          }
        }
      },
      hashtags: {
        isArray: true,
        custom: {
          options: (value: any[]) => {
            if (value.some((hashtag) => typeof hashtag !== 'string')) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEET_MESSAGES.HASHTAGS_MUST_BE_STRING
              })
            }
            return true
          }
        }
      },
      mentions: {
        isArray: true,
        custom: {
          options: (value: any[]) => {
            if (value.some((mention) => !ObjectId.isValid(mention))) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEET_MESSAGES.MENTIONS_MUST_BE_AN_ARRAY_OF_USER_ID
              })
            }
            return true
          }
        }
      },
      medias: {
        isArray: true,
        custom: {
          options: (value: any[]) => {
            if (
              value.some((media) => {
                return typeof media !== 'object' || typeof media.url !== 'string' || !mediaTypes.includes(media.type)
              })
            ) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEET_MESSAGES.MEDIAS_MUST_BE_AN_ARRAY_OF_MEDIA_OBJECTS
              })
            }
            return true
          }
        }
      }
    },
    ['body']
  )
)

export const tweetIdValidator = validate(
  checkSchema(
    {
      tweet_id: {
        isString: true,
        custom: {
          options: async (value) => {
            const tweet_id = value as string

            if (!ObjectId.isValid(tweet_id)) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.BAD_REQUEST,
                message: TWEET_MESSAGES.INVALID_TWEET_ID
              })
            }

            const tweet = await databaseService.tweets.findOne({ _id: new ObjectId(tweet_id) })
            if (!tweet) {
              throw new ErrorWithStatus({
                status: HTTP_STATUS.NOT_FOUND,
                message: TWEET_MESSAGES.TWEET_NOT_FOUND
              })
            }
            return true
          }
        }
      }
    },
    ['body', 'params']
  )
)
