import { Request, Response } from 'express'
import { BOOKMARKS_MESSAGES } from '~/constants/messages'
import { BookmarkBody } from '~/models/interfaces/bookmark.interfaces'
import bookmarksService from '~/services/bookmarks.services'

export const createBookmarkController = async (req: Request, res: Response) => {
  const user_id = req.decodedAuthorization.user_id as string
  const { tweet_id } = req.body as BookmarkBody
  const result = await bookmarksService.createBookmark(user_id, tweet_id)
  return res.json({ message: BOOKMARKS_MESSAGES.CREATE_BOOKMARK_SUCCESSFULLY, result })
}

export const deleteBookmarkController = async (req: Request, res: Response) => {
  const user_id = req.decodedAuthorization.user_id as string
  const { tweet_id } = req.params
  await bookmarksService.deleteBookmark(user_id, tweet_id)
  return res.json({ message: BOOKMARKS_MESSAGES.DELETE_BOOKMARK_SUCCESSFULLY })
}
