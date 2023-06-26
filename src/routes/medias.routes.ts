import { Router } from 'express'
import { uploadSingleImageController } from '~/controllers/medias.controllers'
import { wrapRequestHandler } from '~/utils/handler'

const mediasRouter = Router()

mediasRouter.post('/upload-image', wrapRequestHandler(uploadSingleImageController))

export default mediasRouter
