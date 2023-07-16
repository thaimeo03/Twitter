import { Request, Response } from 'express'
import { TweetType } from '~/constants/enums'
import { TWEET_MESSAGES } from '~/constants/messages'
import { TweetBody } from '~/models/interfaces/tweet.interfaces'
import tweetsService from '~/services/tweets.services'

export const createTweetController = async (req: Request, res: Response) => {
  const user_id = req.decodedAuthorization.user_id as string
  const result = await tweetsService.createTweet(user_id, req.body as TweetBody)

  return res.json({ message: TWEET_MESSAGES.CREATE_TWEET_SUCCESSFULLY, result })
}

export const getTweetController = async (req: Request, res: Response) => {
  const tweet = req.tweet
  const { guest_views, user_views } = await tweetsService.increaseView(
    req.params.tweet_id,
    req.decodedAuthorization.user_id as string
  )

  const result = {
    ...tweet,
    guest_views,
    user_views
  }
  return res.json({ message: TWEET_MESSAGES.GET_TWEET_SUCCESSFULLY, result })
}

export const getTweetChildrenController = async (req: Request, res: Response) => {
  const { tweet_id } = req.params
  const tweet_type = (Number(req.query.tweet_type) as TweetType) || TweetType.Comment
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 5

  const { result, total_pages } = await tweetsService.getTweetChildren({ tweet_id, tweet_type, page, limit })
  return res.json({
    message: TWEET_MESSAGES.GET_TWEET_CHILDREN_SUCCESSFULLY,
    result: {
      tweets: result,
      tweet_type: tweet_type,
      page,
      limit,
      total_pages
    }
  })
}
