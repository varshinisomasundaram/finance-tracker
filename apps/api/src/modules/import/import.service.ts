import { db } from '../../config/database'
import { parseCSVBuffer, parsePDFBuffer, type BankFormat, type ParsedRow } from './import.parser'
import { CATEGORY_RULES } from './import.categories'
import type { ConfirmImportDto } from './import.schema'

interface EnrichedRow extends ParsedRow {
  rowIndex: number
  isDuplicate: boolean
  suggestedCategoryId: string | null
  suggestedCategoryName: string | null
}

interface PreviewResult {
  sessionId: string
  filename: string
  bank: BankFormat
  totalRows: number
  rows: EnrichedRow[]
}

// ─── Duplicate detection ──────────────────────────────────────────────────────

async function findDuplicates(userId: string, rows: ParsedRow[]): Promise<Set<number>> {
  if (rows.length === 0) return new Set()

  const dates = rows.map((r) => new Date(r.date))
  const minDate = new Date(Math.min(...dates.map((d) => d.getTime())))
  const maxDate = new Date(Math.max(...dates.map((d) => d.getTime())))

  minDate.setDate(minDate.getDate() - 1)
  maxDate.setDate(maxDate.getDate() + 1)

  const existing = await db.transaction.findMany({
    where: { userId, date: { gte: minDate, lte: maxDate } },
    select: { date: true, description: true, amount: true },
  })

  const duplicateIndices = new Set<number>()
  rows.forEach((row, idx) => {
    const rowDate = new Date(row.date)
    const rowDesc = row.description.toLowerCase()
    const isDup = existing.some((tx) => {
      const dayDiff = Math.abs(new Date(tx.date).getTime() - rowDate.getTime()) / (1000 * 60 * 60 * 24)
      if (dayDiff > 1) return false
      const amountMatch = Math.abs(Number(tx.amount) - row.amount) < 0.01
      const txDesc = tx.description.toLowerCase()
      const descMatch = txDesc.includes(rowDesc.slice(0, 20)) || rowDesc.includes(txDesc.slice(0, 20))
      return amountMatch && descMatch
    })
    if (isDup) duplicateIndices.add(idx)
  })
  return duplicateIndices
}

// ─── Rule-based categorization ────────────────────────────────────────────────
// Rules live in ./import.categories.ts

interface CategoryHint { id: string; name: string }

async function suggestCategories(
  userId: string,
  rows: ParsedRow[],
): Promise<Map<number, CategoryHint>> {
  if (rows.length === 0) return new Map()

  // Fetch all categories once
  const categories = await db.category.findMany({
    where: { OR: [{ userId }, { isSystem: true }] },
    select: { id: true, name: true },
  })

  const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]))

  const result = new Map<number, CategoryHint>()
  rows.forEach((row, idx) => {
    const desc = row.description
    for (const rule of CATEGORY_RULES) {
      if (rule.pattern.test(desc)) {
        const cat = catByName.get(rule.category.toLowerCase())
        if (cat) { result.set(idx, { id: cat.id, name: cat.name }); break }
      }
    }
  })
  return result
}

// ─── Preview ──────────────────────────────────────────────────────────────────

export async function previewImport(
  userId: string,
  filename: string,
  buffer: Buffer,
  password?: string,
): Promise<PreviewResult> {
  const ext = filename.split('.').pop()?.toLowerCase()

  let parsed: { bank: BankFormat; rows: ParsedRow[] }
  if (ext === 'pdf') {
    parsed = await parsePDFBuffer(buffer, password)
  } else {
    parsed = parseCSVBuffer(buffer)
  }

  const { bank, rows } = parsed

  const [duplicateSet, categoryMap] = await Promise.all([
    findDuplicates(userId, rows),
    suggestCategories(userId, rows),
  ])

  const session = await db.importSession.create({
    data: {
      userId,
      filename,
      status: 'PENDING',
      rowCount: rows.length,
      mappedColumns: JSON.parse(JSON.stringify({ bank, parsedRows: rows })),
    },
  })

  const enrichedRows: EnrichedRow[] = rows.map((row, idx) => {
    const catHint = categoryMap.get(idx) ?? null
    return {
      ...row,
      rowIndex: idx,
      isDuplicate: duplicateSet.has(idx),
      suggestedCategoryId: catHint?.id ?? null,
      suggestedCategoryName: catHint?.name ?? null,
    }
  })

  return { sessionId: session.id, filename, bank, totalRows: rows.length, rows: enrichedRows }
}

// ─── Confirm ──────────────────────────────────────────────────────────────────

export async function confirmImport(
  userId: string,
  dto: ConfirmImportDto,
): Promise<{ imported: number; skipped: number; duplicatesSkipped: number; sessionId: string }> {
  const session = await db.importSession.findFirst({ where: { id: dto.sessionId, userId } })
  if (!session) throw new Error('Import session not found')

  const mappedCols = session.mappedColumns as unknown as { bank: BankFormat; parsedRows: ParsedRow[] }
  const allRows = mappedCols.parsedRows ?? []

  const selectedSet = new Set(dto.selectedRowIndices)
  const rowsToInsert = allRows.filter((_, idx) => selectedSet.has(idx))

  const duplicateSet = await findDuplicates(userId, rowsToInsert)

  let imported = 0
  let duplicatesSkipped = 0

  const CHUNK = 50
  for (let i = 0; i < rowsToInsert.length; i += CHUNK) {
    const chunk = rowsToInsert.slice(i, i + CHUNK)
    const toCreate = chunk
      .map((row, localIdx) => ({ row, originalIdx: i + localIdx }))
      .filter(({ originalIdx }) => !duplicateSet.has(originalIdx))

    if (toCreate.length === 0) {
      duplicatesSkipped += chunk.filter((_, li) => duplicateSet.has(i + li)).length
      continue
    }

    await db.transaction.createMany({
      data: toCreate.map(({ row, originalIdx }) => {
        const selectedRowIdx = dto.selectedRowIndices[i + originalIdx]
        const catId = dto.rowCategories?.[String(selectedRowIdx)] ?? dto.categoryId ?? null
        const type = (dto.rowTypes?.[String(selectedRowIdx)] ?? row.type) as 'INCOME' | 'EXPENSE'
        return {
          userId,
          description: row.description,
          amount: row.amount,
          type,
          date: new Date(row.date),
          categoryId: catId,
          accountId: dto.accountId ?? null,
          tags: [],
        }
      }),
      skipDuplicates: true,
    })

    imported += toCreate.length
    duplicatesSkipped += chunk.length - toCreate.length
  }

  const skipped = allRows.length - rowsToInsert.length

  await db.importSession.update({
    where: { id: session.id },
    data: { status: 'COMPLETED', importedCount: imported, importedAt: new Date() },
  })

  return { imported, skipped, duplicatesSkipped, sessionId: session.id }
}
