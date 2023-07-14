import { TweetBody } from '~/models/interfaces/tweet.interfaces'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Twitter.schema'
import hashtagsService from './hashtag.services'
import { ObjectId } from 'mongodb'

class TweetsService {
  async createTweet(user_id: string, body: TweetBody) {
    const hashtags = body.hashtags
    const hashtagsWithId = await Promise.all(
      hashtags.map(async (name: string) => {
        const result = await hashtagsService.createHashtag(name)
        return result._id
      })
    )

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        ...body,
        hashtags: hashtagsWithId,
        user_id
      })
    )
    const newTweet = await databaseService.tweets.findOne({ _id: result.insertedId })
    return newTweet
  }

  async getTweetDetails(tweet_id: string) {
    const tweets = await databaseService.tweets
      .aggregate<Tweet>([
        {
          $match: {
            _id: new ObjectId(tweet_id)
          }
        },
        {
          $lookup: {
            from: 'hashtags',
            localField: 'hashtags',
            foreignField: '_id',
            as: 'hashtags'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'mentions',
            foreignField: '_id',
            as: 'mentions'
          }
        },
        {
          $addFields: {
            mentions: {
              $map: {
                input: '$mentions',
                as: 'mention',
                in: {
                  _id: '$$mention._id',
                  name: '$$mention.name',
                  username: '$$mention.username',
                  email: '$$mention.email',
                  avatar: '$$mention.avatar'
                }
              }
            }
          }
        },
        {
          $lookup: {
            from: 'bookmarks',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'bookmarks'
          }
        },
        {
          $lookup: {
            from: 'likes',
            localField: '_id',
            foreignField: 'tweet_id',
            as: 'likes'
          }
        },
        {
          $lookup: {
            from: 'tweets',
            localField: '_id',
            foreignField: 'parent_id',
            as: 'tweet_children'
          }
        },
        {
          $addFields: {
            bookmarks: {
              $size: '$bookmarks'
            },
            likes: {
              $size: '$likes'
            },
            retweet_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 1]
                  }
                }
              }
            },
            comment_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 2]
                  }
                }
              }
            },
            quote_count: {
              $size: {
                $filter: {
                  input: '$tweet_children',
                  as: 'item',
                  cond: {
                    $eq: ['$$item.type', 3]
                  }
                }
              }
            },
            total_views: {
              $add: ['$guest_views', '$user_views']
            }
          }
        },
        {
          $project: {
            tweet_children: 0
          }
        }
      ])
      .toArray()

    return tweets[0]
  }
}

const tweetsService = new TweetsService()
export default tweetsService
