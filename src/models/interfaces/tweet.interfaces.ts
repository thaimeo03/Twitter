import { TweetAudience, TweetType } from '~/constants/enums'
import { Media } from './media.interfaces'

export interface TweetBody {
  type: TweetType
  audience: TweetAudience
  content: string
  parent_id: null | string //  chỉ null khi tweet gốc
  hashtags: string[] // ví dụ: "covid19", "virus"
  mentions: string[] // Là user_id
  medias: Media[]
}
