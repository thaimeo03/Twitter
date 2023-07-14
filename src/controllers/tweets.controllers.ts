import { Request, Response } from 'express'
import { TWEET_MESSAGES } from '~/constants/messages'
import { TweetBody } from '~/models/interfaces/tweet.interfaces'
import tweetsService from '~/services/tweets.services'

export const createTweetController = async (req: Request, res: Response) => {
  const user_id = req.decodedAuthorization.user_id as string
  const result = await tweetsService.createTweet(user_id, req.body as TweetBody)

  return res.json({ message: TWEET_MESSAGES.CREATE_TWEET_SUCCESSFULLY, result })
}

export const getTweetController = async (req: Request, res: Response) => {
  const result = req.tweet
  return res.json({ message: TWEET_MESSAGES.GET_TWEET_SUCCESSFULLY, result })
}
