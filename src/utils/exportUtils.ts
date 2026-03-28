/**
 * Export utilities – CSV and PDF (print) export with no external deps.
 */

// ─── CSV ──────────────────────────────────────────────────────────────────────

function escapeCsvCell(value: unknown): string {
  const str = value === null || value === undefined ? '' : String(value)
  // Wrap in quotes if the value contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ]
  const csvContent = '\uFEFF' + csvLines.join('\r\n') // BOM for Excel compat
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${formatDateForFile()}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// ─── PDF (print) ──────────────────────────────────────────────────────────────

export function exportToPDF(
  title: string,
  subtitle: string,
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  const tableRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${cell === null || cell === undefined ? '—' : cell}</td>`).join('')}</tr>`
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #111; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          p.sub { font-size: 13px; color: #555; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th { background: #1e293b; color: #fff; padding: 8px 12px; text-align: left; }
          td { padding: 7px 12px; border-bottom: 1px solid #e5e7eb; }
          tr:nth-child(even) td { background: #f8fafc; }
          .footer { margin-top: 24px; font-size: 11px; color: #888; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <p class="sub">${subtitle} &nbsp;·&nbsp; Generated: ${new Date().toLocaleString('en-IN')}</p>
        <table>
          <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
        <div class="footer">FMS Admin &nbsp;·&nbsp; Confidential</div>
      </body>
    </html>
  `

  const win = window.open('', '_blank', 'width=900,height=700')
  if (!win) {
    alert('Please allow pop-ups to export PDF.')
    return
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
    win.close()
  }, 400)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateForFile(): string {
  const d = new Date()
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`
}

export function formatAmountPlain(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`
}
