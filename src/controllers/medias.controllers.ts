import { Request, Response } from 'express'
import path from 'path'
import { MEDIAS_MESSAGES } from '~/constants/messages'

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const formidable = (await import('formidable')).default
  const form = formidable({
    uploadDir: path.join(__dirname, '..', '..', 'uploads'),
    keepExtensions: true,
    maxFiles: 1,
    maxFileSize: 300 * 1024 // 300kb
  })

  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err
    }
    res.json({ message: MEDIAS_MESSAGES.UPLOAD_IMAGE_SUCCESSFULLY })
  })
}
