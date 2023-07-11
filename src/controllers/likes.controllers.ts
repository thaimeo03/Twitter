import { Request, Response } from 'express'
import { LIKES_MESSAGES } from '~/constants/messages'
import { LikeBody } from '~/models/interfaces/like.interfaces'
import likesService from '~/services/likes.services'

export const likeController = async (req: Request, res: Response) => {
  const user_id = req.decodedAuthorization.user_id as string
  const { tweet_id } = req.body as LikeBody

  const result = await likesService.createLike(user_id, tweet_id)
  return res.json({ message: LIKES_MESSAGES.CREATE_LIKE_SUCCESSFULLY, result })
}

export const dislikeController = async (req: Request, res: Response) => {
  const user_id = req.decodedAuthorization.user_id as string
  const { tweet_id } = req.params

  await likesService.dislike(user_id, tweet_id)
  return res.json({ message: LIKES_MESSAGES.DISLIKE_SUCCESSFULLY })
}
