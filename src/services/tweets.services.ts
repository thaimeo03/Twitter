import { TweetBody } from '~/models/interfaces/tweet.interfaces'
import databaseService from './database.services'
import Tweet from '~/models/schemas/Twitter.schema'
import hashtagsService from './hashtag.services'

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
}

const tweetsService = new TweetsService()
export default tweetsService
