import fs from 'fs'
import { Request } from 'express'
import { File } from 'formidable'
import { UPLOAD_DIR_TEMP } from '~/constants/dir'
export const initUploadFile = () => {
  const uploadsPath = UPLOAD_DIR_TEMP
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, {
      recursive: true
    })
  }
}

export const handleUploadFile = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_DIR_TEMP,
    keepExtensions: true,
    maxFiles: 4,
    maxFileSize: 300 * 1024, // 300kb
    maxTotalFileSize: 4 * 300 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const isImage = name === 'image' && Boolean(mimetype?.includes('image/'))
      if (!isImage) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }

      return isImage
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      // eslint-disable-next-line no-empty
      if (!files.image) {
        return reject(new Error('File is empty'))
      }

      resolve(files.image as File[])
    })
  })
}

export const getNameImage = (nameWithExtension: string) => {
  const name = nameWithExtension.split('.')[0]
  return name
}
