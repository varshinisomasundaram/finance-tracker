import { z } from 'zod'

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  currency: z.string().length(3).optional(),
  avatarUrl: z.string().url().optional().nullable(),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8)
    .max(100)
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
})

export const UserResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  currency: z.string(),
  avatarUrl: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type UpdateUserDto = z.infer<typeof UpdateUserSchema>
export type ChangePasswordDto = z.infer<typeof ChangePasswordSchema>
export type UserResponse = z.infer<typeof UserResponseSchema>
