import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'
import 'dotenv/config'
import fs from 'fs'
import path from 'path'

// Create SES service object.
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string
  }
})

const createSendEmailCommand = ({
  fromAddress,
  toAddresses,
  ccAddresses = [],
  body,
  subject,
  replyToAddresses = []
}: {
  fromAddress: string
  toAddresses: string | string[]
  ccAddresses?: string[]
  body: string
  subject: string
  replyToAddresses?: string[]
}) => {
  return new SendEmailCommand({
    Destination: {
      /* required */
      CcAddresses: ccAddresses instanceof Array ? ccAddresses : [ccAddresses],
      ToAddresses: toAddresses instanceof Array ? toAddresses : [toAddresses]
    },
    Message: {
      /* required */
      Body: {
        /* required */
        Html: {
          Charset: 'UTF-8',
          Data: body
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject
      }
    },
    Source: fromAddress,
    ReplyToAddresses: replyToAddresses instanceof Array ? replyToAddresses : [replyToAddresses]
  })
}

export const sendVerifyEmail = async (toAddress: string, subject: string, body: string) => {
  const sendEmailCommand = createSendEmailCommand({
    fromAddress: process.env.SES_FROM_ADDRESS as string,
    toAddresses: toAddress as string,
    body,
    subject
  })

  try {
    return await sesClient.send(sendEmailCommand)
  } catch (e) {
    console.error('Failed to send email.')
    return e
  }
}

const verifyEmailTemplate = fs.readFileSync(path.join('src/templates/verify-email.html'), 'utf8')
const verifyPasswordTemplate = fs.readFileSync(path.join('src/templates/reset-password.html'), 'utf8')

export const sendVerifyRegisterEmail = (email_verify_token: string, toAddress: string) => {
  return sendVerifyEmail(
    toAddress,
    'Verify your email',
    verifyEmailTemplate.replace(/{{action_url}}/g, `${process.env.URL_CLIENT}/verify-email?token=${email_verify_token}`)
  )
}

export const sendVerifyResetPassword = (forgot_password_token: string, name: string, toAddress: string) => {
  return sendVerifyEmail(
    toAddress,
    'Verify your email',
    verifyPasswordTemplate
      .replace(/{{action_url}}/g, `${process.env.URL_CLIENT}/reset-password?token=${forgot_password_token}`)
      .replace('{{name}}', name)
  )
}
