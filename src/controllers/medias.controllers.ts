import { Request, Response } from 'express'
import path from 'path'
import { UPLOAD_VIDEO_DIR } from '~/constants/dir'
import HTTP_STATUS from '~/constants/httpStatus'
import { MEDIAS_MESSAGES } from '~/constants/messages'
import mediasService from '~/services/medias.services'
import fs from 'fs'
import mime from 'mime'

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

export const streamingVideoController = async (req: Request, res: Response) => {
  const range = req.headers.range
  if (!range) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: MEDIAS_MESSAGES.REQUIRED_RANGE })
  }
  const { name } = req.params

  const videoPath = path.resolve(UPLOAD_VIDEO_DIR, name)
  const videoSize = fs.statSync(videoPath).size
  const CHUNK_SIZE = 10 ** 6 // 1MB
  const start = Number(range.replace(/\D/g, ''))
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1)
  const contentLength = end - start + 1
  const contentType = mime.getType(videoPath) || 'video/*'

  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': contentType
  }
  res.writeHead(HTTP_STATUS.PARTIAL_CONTENT, headers)
  const videoStream = fs.createReadStream(videoPath, { start, end })
  videoStream.pipe(res)
}

export const uploadVideoHLSController = async (req: Request, res: Response) => {
  const result = await mediasService.uploadVideoHLS(req)

  return res.json({
    message: MEDIAS_MESSAGES.UPLOAD_IMAGE_SUCCESSFULLY,
    result: result
  })
}
