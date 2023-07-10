import { ObjectId } from 'mongodb'

interface HashtagConstructorType {
  _id?: ObjectId
  name: string
  created_at?: Date
}

export default class Hashtag {
  _id?: ObjectId
  name: string
  created_at?: Date

  constructor(hashtag: HashtagConstructorType) {
    this._id = hashtag._id || new ObjectId()
    this.name = hashtag.name
    this.created_at = hashtag.created_at || new Date()
  }
}
