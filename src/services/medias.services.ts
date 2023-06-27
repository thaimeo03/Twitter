import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameImage, handleUploadFile } from '~/utils/file'
import fs from 'fs'
import 'dotenv/config'
import { isProduction } from '~/constants/congfig'
import { MediaType } from '~/constants/enums'
import { Media } from '~/models/interfaces/media.interfaces'

class MediasService {
  async uploadFile(req: Request) {
    const imagesData = await handleUploadFile(req)

    const result: Media[] = await Promise.all(
      imagesData.map(async (imageData) => {
        const nameImage = getNameImage(imageData.newFilename)
        const pathImage = path.join(UPLOAD_DIR, `${nameImage}.jpg`)

        await sharp(imageData.filepath).jpeg().toFile(pathImage)
        fs.unlinkSync(imageData.filepath)

        return {
          url: isProduction
            ? `${process.env.HOST}/static/${nameImage}.jpg`
            : `http://localhost:${process.env.PORT}/static/${nameImage}.jpg`,
          type: MediaType.Image
        }
      })
    )

    return result
  }
}

const mediasService = new MediasService()
export default mediasService
