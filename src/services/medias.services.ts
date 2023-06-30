import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameImage, uploadImageFile, uploadVideoFile } from '~/utils/file'
import fs from 'fs'
import 'dotenv/config'
import { isProduction } from '~/constants/congfig'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/interfaces/media.interfaces'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'

class MediasService {
  async uploadImage(req: Request) {
    const imagesData = await uploadImageFile(req)

    const result: Media[] = await Promise.all(
      imagesData.map(async (imageData) => {
        const nameImage = getNameImage(imageData.newFilename)
        const pathImage = path.join(UPLOAD_IMAGE_DIR, `${nameImage}.jpg`)

        await sharp(imageData.filepath).jpeg().toFile(pathImage)
        fs.unlinkSync(imageData.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/image/${imageData.newFilename}`
            : `http://localhost:${process.env.PORT}/static/image/${imageData.newFilename}`,
          type: MediaType.Image
        }
      })
    )

    return result
  }

  async uploadVideo(req: Request) {
    const videosData = await uploadVideoFile(req)

    const result: Media[] = await Promise.all(
      videosData.map(async (video) => {
        return {
          url: isProduction
            ? `${process.env.HOST}/medias/video-stream/${video.newFilename}`
            : `http://localhost:${process.env.PORT}/medias/video-stream/${video.newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return result
  }

  async uploadVideoHLS(req: Request) {
    const videosData = await uploadVideoFile(req)

    const result: Media[] = await Promise.all(
      videosData.map(async (video) => {
        await encodeHLSWithMultipleVideoStreams(video.filepath)
        return {
          url: isProduction
            ? `${process.env.HOST}/medias/video-stream/${video.newFilename}`
            : `http://localhost:${process.env.PORT}/medias/video-stream/${video.newFilename}`,
          type: MediaType.Video
        }
      })
    )
    return result
  }
}

const mediasService = new MediasService()
export default mediasService
