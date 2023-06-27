import fs from 'fs'
import { Request } from 'express'
import { File } from 'formidable'
import { UPLOAD_DIR_TEMP, UPLOAD_VIDEO_DIR, UPLOAD_IMAGE_DIR } from '~/constants/dir'
import path from 'path'
export const initUploadFile = () => {
  ;[UPLOAD_DIR_TEMP, UPLOAD_VIDEO_DIR, UPLOAD_IMAGE_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, {
        recursive: true
      })
    }
  })
}

export const uploadImageFile = async (req: Request) => {
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

export const uploadVideoFile = async (req: Request) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: UPLOAD_VIDEO_DIR,
    maxFiles: 2,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    maxTotalFileSize: 2 * 50 * 1024 * 1024,
    filter: function ({ name, originalFilename, mimetype }) {
      const isVideo = name === 'video' && Boolean(mimetype?.includes('video/'))
      if (!isVideo) {
        form.emit('error' as any, new Error('File type is not valid') as any)
      }

      return true
    }
  })

  return new Promise<File[]>((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        return reject(err)
      }

      // eslint-disable-next-line no-empty
      if (!files.video) {
        return reject(new Error('File is empty'))
      }

      // const extention

      ;(files.video as File[]).forEach((file) => {
        const extension = getExtension(file.originalFilename as string)
        const newFilename = `${file.newFilename}.${extension}`
        file.newFilename = newFilename
        fs.renameSync(file.filepath, path.join(UPLOAD_VIDEO_DIR, newFilename))
      })

      resolve(files.video as File[])
    })
  })
}

export const getNameImage = (nameWithExtension: string) => {
  const name = nameWithExtension.split('.')[0]
  return name
}

export const getExtension = (nameWithExtension: string) => {
  const extension = nameWithExtension.split('.')
  return extension[extension.length - 1]
}
