import Bookmark from '~/models/schemas/Bookmark.schema'
import databaseService from './database.services'
import { ObjectId, WithId } from 'mongodb'
import Tweet from '~/models/schemas/Twitter.schema'

class BookmarksService {
  async createBookmark(user_id: string, tweet_id: string) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmark({ user_id, tweet_id })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    )

    return {
      bookmark_id: (result.value as WithId<Tweet>)._id
    }
  }

  async deleteBookmark(user_id: string, tweet_id: string) {
    await databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    })
  }
}

const bookmarksService = new BookmarksService()
export default bookmarksService
