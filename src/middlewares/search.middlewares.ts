import { checkSchema } from 'express-validator'
import { MediaQuery } from '~/constants/enums'
import { validate } from '~/utils/validate'

export const searchValidator = validate(
  checkSchema(
    {
      content: {
        isString: true
      },
      media: {
        optional: true,
        isIn: {
          options: [Object.values(MediaQuery)]
        }
      },
      pf: {
        optional: true,
        isIn: {
          options: ['true', 'false']
        }
      }
    },
    ['query']
  )
)
