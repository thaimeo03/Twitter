import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_IMAGE_DIR } from '~/constants/dir'
import { getNameImage, uploadImageFile, uploadVideoFile } from '~/utils/file'
import fsPromise from 'fs/promises'
import { isProduction } from '~/constants/congfig'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/interfaces/media.interfaces'
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video'
import { uploadImageToS3, uploadVideoToS3 } from '~/utils/s3'
import mime from 'mime'
import 'dotenv/config'
import { CompleteMultipartUploadCommandOutput } from '@aws-sdk/client-s3'

class MediasService {
  async uploadImage(req: Request) {
    const imagesData = await uploadImageFile(req)

    const result: Media[] = await Promise.all(
      imagesData.map(async (imageData) => {
        const nameImage = getNameImage(imageData.newFilename)
        const pathImage = path.join(UPLOAD_IMAGE_DIR, `${nameImage}.jpg`)

        await sharp(imageData.filepath).jpeg().toFile(pathImage)

        const res = await uploadImageToS3({
          nameFile: `${nameImage}.jpg`,
          filepath: pathImage,
          type: mime.getType(pathImage) as string
        })

        await Promise.all([fsPromise.unlink(imageData.filepath), fsPromise.unlink(pathImage)])

        return {
          url: (res as CompleteMultipartUploadCommandOutput).Location as string,
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
        const res = await uploadVideoToS3({
          nameFile: video.newFilename,
          filepath: video.filepath,
          type: mime.getType(video.filepath) as string
        })

        return {
          url: (res as CompleteMultipartUploadCommandOutput).Location as string,
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
