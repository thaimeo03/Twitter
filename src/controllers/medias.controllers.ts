import { Request, Response } from 'express'
import { MEDIAS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'

export const uploadImageController = async (req: Request, res: Response) => {
  const result = await mediasService.uploadImage(req)

  return res.json({
    message: MEDIAS_MESSAGES.UPLOAD_IMAGE_SUCCESSFULLY,
    result: result
  })
}

export const uploadVideoController = async (req: Request, res: Response) => {
  const result = await mediasService.uploadVideo(req)

  return res.json({
    message: MEDIAS_MESSAGES.UPLOAD_IMAGE_SUCCESSFULLY,
    result: result
  })
}
