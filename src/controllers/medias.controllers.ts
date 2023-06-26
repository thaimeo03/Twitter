import { Request, Response } from 'express'
import path from 'path'
import { MEDIAS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import { handleUploadSingleFile } from '~/utils/file'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await mediasService.uploadFile(req)

  return res.json({
    message: MEDIAS_MESSAGES.UPLOAD_IMAGE_SUCCESSFULLY,
    result
  })
}
