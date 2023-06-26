import path from 'path'
import fs from 'fs'

export const initUploadFile = () => {
  const uploadsPath = path.join(__dirname, '..', '..', 'uploads')
  if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, {
      recursive: true
    })
  }
}
