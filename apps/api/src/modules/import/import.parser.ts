import { parse } from 'csv-parse/sync'

export type BankFormat = 'HDFC' | 'ICICI' | 'SBI' | 'AXIS' | 'KOTAK' | 'GENERIC'

export interface ParsedRow {
  date: string        // ISO 8601
  description: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  originalText: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_MAP: Record<string, string> = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
}

function normalizeHeader(h: string): string {
  return h.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim().replace(/\s+/g, ' ')
}

/**
 * Parses Indian bank date formats:
 *  DD/MM/YY, DD/MM/YYYY, DD-MM-YYYY
 *  DD MMM YYYY, DD-MMM-YYYY, DD MMM YY  (e.g. "01 Mar 2026", "01-Mar-26")
 */
function parseIndianDate(dateStr: string): string {
  const s = dateStr.trim()

  // DD/MM/YY or DD/MM/YYYY or DD-MM-YYYY
  const m1 = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (m1) {
    let [, d, mo, y] = m1
    if (y.length === 2) y = parseInt(y) > 50 ? `19${y}` : `20${y}`
    const iso = `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`
    const dt = new Date(iso)
    if (!isNaN(dt.getTime())) return dt.toISOString()
  }

  // DD MMM YYYY or DD-MMM-YYYY or DD MMM YY  (e.g. "01 Mar 2026", "1-Mar-26")
  const m2 = s.match(/^(\d{1,2})[\s\-]([A-Za-z]{3,9})[\s\-](\d{2,4})$/)
  if (m2) {
    let [, d, mon, y] = m2
    const mo = MONTH_MAP[mon.toLowerCase().slice(0, 3)]
    if (mo) {
      if (y.length === 2) y = parseInt(y) > 50 ? `19${y}` : `20${y}`
      const iso = `${y}-${mo}-${d.padStart(2, '0')}`
      const dt = new Date(iso)
      if (!isNaN(dt.getTime())) return dt.toISOString()
    }
  }

  // YYYY-MM-DD (ISO)
  const m3 = s.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/)
  if (m3) {
    const dt = new Date(s)
    if (!isNaN(dt.getTime())) return dt.toISOString()
  }

  throw new Error(`Cannot parse date: ${dateStr}`)
}

function parseAmount(s: string): number {
  if (!s) return 0
  const cleaned = s.replace(/[₹$,\s]/g, '').trim()
  if (!cleaned || cleaned === '-' || /^nil$/i.test(cleaned)) return 0
  const n = parseFloat(cleaned)
  return isNaN(n) ? 0 : Math.abs(n)
}

/** Returns EXPENSE/INCOME from a raw amount cell value (handles Dr/Cr suffixes and +/- signs) */
function typeFromRaw(raw: string): 'INCOME' | 'EXPENSE' {
  if (/\bCr\b/i.test(raw)) return 'INCOME'
  if (/\bDr\b/i.test(raw)) return 'EXPENSE'
  if (raw.trim().startsWith('-')) return 'INCOME'   // credit card: negative = payment/refund
  return 'EXPENSE'
}

function findColIdx(headers: string[], ...patterns: string[]): number {
  const normalized = headers.map(normalizeHeader)
  for (const pat of patterns) {
    const idx = normalized.findIndex((h) => h === pat || h.includes(pat))
    if (idx !== -1) return idx
  }
  return -1
}

// ─── Bank Detection ───────────────────────────────────────────────────────────

export function detectBank(headers: string[]): BankFormat {
  const normalized = headers.map(normalizeHeader)
  const has = (...pats: string[]) => pats.every((p) => normalized.some((h) => h.includes(p)))

  if (has('narration') && has('withdrawal amt')) return 'HDFC'
  if (has('transaction details') || has('transaction detail')) return 'HDFC'  // HDFC credit card CSV
  if (has('txn date') && has('description') && (has('debit') || has('credit'))) return 'SBI'
  if (has('tran date') && has('particulars') && (normalized.some((h) => h === 'dr') || normalized.some((h) => h === 'cr'))) return 'AXIS'
  if (has('debit amount') && has('credit amount') && has('transaction date')) return 'KOTAK'
  if (has('transaction date') && (normalized.some((h) => h === 'debit') || normalized.some((h) => h === 'credit'))) return 'ICICI'
  return 'GENERIC'
}

// ─── Row parser ────────────────────────────────────────────────────────────────

function parseRows(
  rows: string[][],
  dateIdx: number,
  descIdx: number,
  debitIdx: number,
  creditIdx: number,
  amountIdx = -1,
): ParsedRow[] {
  const result: ParsedRow[] = []
  for (const row of rows) {
    const dateStr = row[dateIdx]?.trim()
    if (!dateStr || dateStr.length < 5) continue
    const desc = descIdx !== -1 ? (row[descIdx]?.trim() ?? '') : ''
    if (!desc) continue

    try {
      const date = parseIndianDate(dateStr)
      let amount = 0
      let type: 'INCOME' | 'EXPENSE' = 'EXPENSE'

      if (debitIdx !== -1 || creditIdx !== -1) {
        const debit = debitIdx !== -1 ? parseAmount(row[debitIdx] ?? '') : 0
        const credit = creditIdx !== -1 ? parseAmount(row[creditIdx] ?? '') : 0
        if (debit > 0) {
          amount = debit; type = 'EXPENSE'
        } else if (credit > 0) {
          amount = credit; type = 'INCOME'
        } else {
          continue
        }
      } else if (amountIdx !== -1) {
        const raw = row[amountIdx]?.trim() ?? ''
        amount = parseAmount(raw)
        if (amount === 0) continue
        type = typeFromRaw(raw)
      } else {
        continue
      }

      result.push({ date, description: desc, amount, type, originalText: row.join(',') })
    } catch {
      // skip unparseable rows
    }
  }
  return result
}

// ─── CSV Parsing ──────────────────────────────────────────────────────────────

export function parseCSVBuffer(buffer: Buffer): { bank: BankFormat; rows: ParsedRow[] } {
  const text = buffer.toString('utf-8').replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  let records: string[][]
  try {
    records = parse(text, {
      skip_empty_lines: true,
      relax_column_count: true,
      trim: true,
    }) as string[][]
  } catch {
    return { bank: 'GENERIC', rows: [] }
  }

  if (records.length < 2) return { bank: 'GENERIC', rows: [] }

  // Find the header row (first row with >= 3 columns containing date/amount keywords)
  let headerIdx = 0
  for (let i = 0; i < Math.min(20, records.length); i++) {
    const row = records[i]
    if (
      row.length >= 3 &&
      row.some((c) => /date|narration|description|particulars|transaction|details/i.test(c))
    ) {
      headerIdx = i
      break
    }
  }

  const headers = records[headerIdx]
  const bank = detectBank(headers)
  const dataRows = records.slice(headerIdx + 1)

  // Find columns — order matters: more specific aliases first
  const dateIdx = findColIdx(headers, 'transaction date', 'txn date', 'tran date', 'value date', 'value dt', 'date')
  const descIdx = findColIdx(headers, 'transaction details', 'transaction detail', 'narration', 'description', 'particulars', 'transaction remarks', 'remarks', 'details')
  const debitIdx = findColIdx(headers, 'withdrawal amt.', 'withdrawal amt', 'debit amount', 'debit', 'dr')
  const creditIdx = findColIdx(headers, 'deposit amt.', 'deposit amt', 'credit amount', 'credit', 'cr')
  // Amount column — avoid matching reward points or international amount columns
  const amountIdx = (() => {
    const normalized = headers.map(normalizeHeader)
    // Prefer "Amount (INR)" or "Amount(In Rs.)" over plain "Amount"
    const priority = ['amount in rs', 'amount inr', 'amount']
    for (const pat of priority) {
      const idx = normalized.findIndex((h) => h.includes(pat) && !h.includes('reward') && !h.includes('intl') && !h.includes('point'))
      if (idx !== -1 && idx !== debitIdx && idx !== creditIdx) return idx
    }
    return -1
  })()

  const rows = parseRows(dataRows, dateIdx, descIdx, debitIdx, creditIdx, amountIdx)
  return { bank, rows }
}

// ─── PDF Parsing ──────────────────────────────────────────────────────────────

export async function parsePDFBuffer(
  buffer: Buffer,
  password?: string,
): Promise<{ bank: BankFormat; rows: ParsedRow[] }> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js')

  const uint8Array = new Uint8Array(buffer)
  const loadingTask = pdfjsLib.getDocument({
    data: uint8Array,
    password: password ?? '',
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  })

  let pdfDoc: any
  try {
    pdfDoc = await loadingTask.promise
  } catch (err: any) {
    if (err?.name === 'PasswordException') {
      throw new Error(err.message?.includes('incorrect') ? 'Incorrect PDF password' : 'PDF is password-protected')
    }
    throw err
  }

  // Extract text from all pages with tolerance-based Y grouping
  let fullText = ''
  const LINE_TOLERANCE = 3 // px — items within 3px of Y are considered the same line

  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i)
    const content = await page.getTextContent()

    const items: Array<{ str: string; y: number; x: number }> = content.items
      .map((item: any) => ({
        str: (item.str ?? '').trim(),
        y: item.transform?.[5] ?? 0,
        x: item.transform?.[4] ?? 0,
      }))
      .filter((item: { str: string }) => item.str.length > 0)

    if (items.length === 0) continue

    // Sort by Y descending (PDF origin is bottom-left)
    items.sort((a, b) => b.y - a.y)

    // Group items into lines with tolerance
    const lines: Array<{ y: number; items: Array<{ str: string; x: number }> }> = []
    for (const item of items) {
      const last = lines[lines.length - 1]
      if (last && Math.abs(last.y - item.y) <= LINE_TOLERANCE) {
        last.items.push({ str: item.str, x: item.x })
      } else {
        lines.push({ y: item.y, items: [{ str: item.str, x: item.x }] })
      }
    }

    // Sort each line's items by X (left to right), then join
    for (const line of lines) {
      line.items.sort((a, b) => a.x - b.x)
      fullText += line.items.map((it) => it.str).join(' ') + '\n'
    }
  }

  // Detect bank from text content
  let bank: BankFormat = 'GENERIC'
  if (/HDFC BANK/i.test(fullText)) bank = 'HDFC'
  else if (/ICICI BANK/i.test(fullText)) bank = 'ICICI'
  else if (/STATE BANK OF INDIA/i.test(fullText)) bank = 'SBI'
  else if (/AXIS BANK/i.test(fullText)) bank = 'AXIS'
  else if (/KOTAK/i.test(fullText)) bank = 'KOTAK'

  const rows = parsePDFText(fullText)
  return { bank, rows }
}

function parsePDFText(text: string): ParsedRow[] {
  const result: ParsedRow[] = []
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  // Match lines starting with a date in any supported format:
  // HDFC CC:  "14/01/2026| 14:54 DESCRIPTION" (pipe + time separator)
  // Standard: "DD/MM/YYYY description", "DD-MM-YYYY description"
  // Alpha:    "DD MMM YYYY description", "DD-MMM-YYYY description"
  const datePatterns = [
    /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\|\s*\d{1,2}:\d{2}\s+(.+)$/, // HDFC CC date|time
    /^(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+(.+)$/,
    /^(\d{1,2}[\s\-][A-Za-z]{3,9}[\s\-]\d{2,4})\s+(.+)$/,
  ]

  for (const line of lines) {
    let dateStr: string | undefined
    let rest: string | undefined

    for (const re of datePatterns) {
      const m = line.match(re)
      if (m) { dateStr = m[1]; rest = m[2]; break }
    }
    if (!dateStr || !rest) continue

    try {
      const date = parseIndianDate(dateStr)

      // Detect HDFC CC credit/payment: line has "+ C amount" (₹ rendered as "C")
      const isCredit = /\+\s*[C₹]\s*[\d,]/.test(rest)

      // Strip trailing single-char PI/category icon (e.g. "l" in HDFC CC PDFs)
      // These appear as a single lowercase letter after the amount: "578.00 l"
      const restClean = rest.replace(/\s+[a-z]$/, '')

      // Amount at end of line: Indian number format, optional Dr/Cr suffix
      const amountRe = /(\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?)(?:\s*(Dr|Cr|DR|CR))?(?:\s*(?:\d[\d,.]*))?$/
      const amtMatch = restClean.match(amountRe)
      if (!amtMatch) continue

      const amountStr = amtMatch[1]
      const drCrSuffix = amtMatch[2]

      let type: 'INCOME' | 'EXPENSE' = 'EXPENSE'
      if (drCrSuffix) {
        type = /^cr$/i.test(drCrSuffix) ? 'INCOME' : 'EXPENSE'
      } else if (isCredit) {
        type = 'INCOME'
      } else if (/credit payment|salary|refund|reversal|cashback/i.test(rest)) {
        type = 'INCOME'
      }

      const amount = parseAmount(amountStr)
      if (amount === 0) continue

      // Description = text before the amount; strip trailing currency symbol (C / ₹ / + C)
      const amtPos = restClean.lastIndexOf(amountStr)
      const desc = restClean
        .slice(0, amtPos)
        .replace(/[\s+]*[C₹]\s*$/, '') // strip "C", "+ C", "₹" (₹ rendered as "C" in HDFC CC)
        .trim()
        .replace(/\s+/g, ' ')
      if (!desc || desc.length < 2) continue

      // Skip CC payment entries — balance repayments are inter-account transfers, not income
      // No \b — description may have no space between "PAYMENT" and next word (PDF extraction artefact)
      if (/^credit card payment/i.test(desc) || /^payment (received|thank you)/i.test(desc)) continue

      result.push({ date, description: desc, amount, type, originalText: line })
    } catch {
      // skip
    }
  }

  return result
}
