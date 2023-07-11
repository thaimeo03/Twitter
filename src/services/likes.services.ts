import { ObjectId, WithId } from 'mongodb'
import databaseService from './database.services'
import Like from '~/models/schemas/Like.schema'

class LikesService {
  async createLike(user_id: string, tweet_id: string) {
    const result = await databaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Like({ user_id, tweet_id })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )

    return {
      like_id: (result.value as WithId<Like>)._id
    }
  }

  async dislike(user_id: string, tweet_id: string) {
    await databaseService.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
  }
}

const likesService = new LikesService()
export default likesService
