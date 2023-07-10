import Hashtag from '~/models/schemas/Hashtag.schema'
import databaseService from './database.services'
import { WithId } from 'mongodb'

class HashtagsService {
  async createHashtag(name: string) {
    const result = await databaseService.hashtags.findOneAndUpdate(
      { name },
      { $setOnInsert: new Hashtag({ name }) },
      { upsert: true, returnDocument: 'after' }
    )
    return result.value as WithId<Hashtag>
  }
}

const hashtagsService = new HashtagsService()
export default hashtagsService
