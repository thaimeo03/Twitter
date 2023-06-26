import { Request } from 'express'
import path from 'path'
import sharp from 'sharp'
import { UPLOAD_DIR } from '~/constants/dir'
import { getNameImage, handleUploadSingleFile } from '~/utils/file'
import fs from 'fs'

class MediasService {
  async uploadFile(req: Request) {
    const imageData = await handleUploadSingleFile(req)
    const nameImage = getNameImage(imageData.newFilename)
    const pathImage = path.join(UPLOAD_DIR, `${nameImage}.jpg`)

    await sharp(imageData.filepath).jpeg().toFile(pathImage)
    fs.unlinkSync(imageData.filepath)

    return `http://localhost:3000/uploads/${nameImage}.jpg`
  }
}

const mediasService = new MediasService()
export default mediasService
