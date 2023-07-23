import { NextFunction, Request, Response } from 'express'
import { TWEET_MESSAGES } from '~/constants/messages'
import searchService from '~/services/search.services'

export const searchContentController = async (req: Request, res: Response, next: NextFunction) => {
  const user_id = req.decodedAuthorization.user_id as string
  const content = req.query.content as string
  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10

  const { result, total_pages } = await searchService.searchContent({ user_id, content, page, limit })

  return res.json({
    message: TWEET_MESSAGES.GET_NEW_FEEDS_SUCCESSFULLY,
    result: {
      tweets: result,
      page,
      limit,
      total_pages
    }
  })
}
