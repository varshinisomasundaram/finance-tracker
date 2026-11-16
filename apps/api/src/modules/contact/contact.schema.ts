import { z } from 'zod'

export const ContactFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters').max(150),
  message: z.string().min(20, 'Message must be at least 20 characters').max(3000),
})

export type ContactFormDto = z.infer<typeof ContactFormSchema>

export const ContactResponseSchema = z.object({
  message: z.string(),
})
