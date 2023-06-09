import { loginController, registerController } from '~/controllers/users.controllers'
import { loginValidator, registerValidator } from '~/middlewares/users.middlewares'
import { Router } from 'express'
import { wrapRequestHandler } from '~/utils/handler'

const usersRouter = Router()

usersRouter.post('/login', loginValidator, wrapRequestHandler(loginController))

// name, email, password, confirm_password, date_of_birth
usersRouter.post('/register', registerValidator, wrapRequestHandler(registerController))

export default usersRouter
