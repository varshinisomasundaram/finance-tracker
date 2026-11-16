import { FastifyInstance } from 'fastify'
import nodemailer from 'nodemailer'
import { ContactFormSchema, ContactResponseSchema } from './contact.schema'
import { config } from '../../config/env'

function buildTransporter() {
  const host = config.get('SMTP_HOST')
  const user = config.get('SMTP_USER')
  const pass = config.get('SMTP_PASS')

  if (!host || !user || !pass) return null

  return nodemailer.createTransport({
    host,
    port: config.get('SMTP_PORT') ?? 587,
    secure: (config.get('SMTP_PORT') ?? 587) === 465,
    auth: { user, pass },
  })
}

export async function contactRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/',
    {
      schema: {
        tags: ['Contact'],
        summary: 'Submit a contact form message',
        body: ContactFormSchema,
        response: {
          200: ContactResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { name, email, subject, message } = request.body as {
        name: string; email: string; subject: string; message: string
      }

      const contactTo = config.get('CONTACT_TO')
      const smtpFrom = config.get('SMTP_FROM') ?? `FinanceTracker <no-reply@financetracker.app>`
      const transporter = buildTransporter()

      if (transporter && contactTo) {
        // Send email to company inbox
        await transporter.sendMail({
          from: smtpFrom,
          to: contactTo,
          replyTo: `"${name}" <${email}>`,
          subject: `[Contact Form] ${subject}`,
          text: [
            `Name:    ${name}`,
            `Email:   ${email}`,
            `Subject: ${subject}`,
            '',
            'Message:',
            message,
          ].join('\n'),
          html: `
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Subject:</strong> ${subject}</p>
            <hr />
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          `,
        })

        // Send confirmation to the sender
        await transporter.sendMail({
          from: smtpFrom,
          to: email,
          subject: `We received your message — FinanceTracker`,
          text: [
            `Hi ${name},`,
            '',
            `Thank you for reaching out. We've received your message and will get back to you within 2 business days.`,
            '',
            `Your message:`,
            `Subject: ${subject}`,
            message,
            '',
            '— FinanceTracker Team',
          ].join('\n'),
          html: `
            <p>Hi <strong>${name}</strong>,</p>
            <p>Thank you for reaching out. We've received your message and will get back to you within 2 business days.</p>
            <hr />
            <p><strong>Subject:</strong> ${subject}</p>
            <p style="white-space: pre-wrap; color: #555">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
            <hr />
            <p style="color: #888; font-size: 13px">— FinanceTracker Team</p>
          `,
        })

        fastify.log.info({ name, email, subject }, 'Contact form submission sent via email')
      } else {
        // Fallback: log to console when SMTP is not configured
        fastify.log.info(
          { name, email, subject, message },
          '📬 Contact form submission (SMTP not configured — set SMTP_HOST/SMTP_USER/SMTP_PASS/CONTACT_TO to enable email)',
        )
      }

      return reply.send({ message: 'Message received. We\'ll be in touch soon!' })
    },
  )
}
