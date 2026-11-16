import { z } from 'zod'

export const ConfirmImportSchema = z.object({
  sessionId: z.string(),
  selectedRowIndices: z.array(z.number().int().min(0)),
  categoryId: z.string().optional(),       // global fallback category
  accountId: z.string().optional(),
  rowCategories: z.record(z.string(), z.string()).optional(), // { "0": categoryId, "1": categoryId }
  rowTypes: z.record(z.string(), z.enum(['INCOME', 'EXPENSE'])).optional(), // { "0": "EXPENSE" }
})

export const ParsedRowSchema = z.object({
  rowIndex: z.number(),
  date: z.string(),
  description: z.string(),
  amount: z.number(),
  type: z.enum(['INCOME', 'EXPENSE']),
  isDuplicate: z.boolean(),
  originalText: z.string(),
  suggestedCategoryId: z.string().nullable().optional(),
  suggestedCategoryName: z.string().nullable().optional(),
})

export const PreviewResponseSchema = z.object({
  sessionId: z.string(),
  filename: z.string(),
  bank: z.string(),
  totalRows: z.number(),
  rows: z.array(ParsedRowSchema),
})

export const ConfirmResponseSchema = z.object({
  imported: z.number(),
  skipped: z.number(),
  duplicatesSkipped: z.number(),
  sessionId: z.string(),
})

export type ConfirmImportDto = z.infer<typeof ConfirmImportSchema>
