import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameImage, handleUploadSingleFile } from '~/utils/file'
import fs from 'fs'
import 'dotenv/config'
import { isProduction } from '~/constants/congfig'

class MediasService {
  async uploadFile(req: Request) {
    const imageData = await handleUploadSingleFile(req)
    const nameImage = getNameImage(imageData.newFilename)
    const pathImage = path.join(UPLOAD_DIR, `${nameImage}.jpg`)

    await sharp(imageData.filepath).jpeg().toFile(pathImage)
    fs.unlinkSync(imageData.filepath)

    return isProduction
      ? `${process.env.HOST}/medias/${nameImage}.jpg`
      : `http://localhost:${process.env.PORT}/medias/${nameImage}.jpg`
  }
}

const mediasService = new MediasService()
export default mediasService
