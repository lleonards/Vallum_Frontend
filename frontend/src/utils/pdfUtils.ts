import { PDFDocument, degrees } from 'pdf-lib'

export async function rotatePDFPage(
  pdfBytes: ArrayBuffer,
  pageIndex: number,
  angle: number
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const page = pdfDoc.getPage(pageIndex)
  const currentRotation = page.getRotation().angle
  page.setRotation(degrees((currentRotation + angle) % 360))
  return pdfDoc.save()
}

export async function flipPageOrientation(
  pdfBytes: ArrayBuffer,
  pageIndex: number
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const page = pdfDoc.getPage(pageIndex)
  const { width, height } = page.getSize()
  page.setSize(height, width)
  return pdfDoc.save()
}

export async function reorderPages(
  pdfBytes: ArrayBuffer,
  newOrder: number[]
): Promise<Uint8Array> {
  const srcDoc = await PDFDocument.load(pdfBytes)
  const newDoc = await PDFDocument.create()
  const copiedPages = await newDoc.copyPages(srcDoc, newOrder)
  copiedPages.forEach((page) => newDoc.addPage(page))
  return newDoc.save()
}

export async function deletePages(
  pdfBytes: ArrayBuffer,
  pageIndices: number[]
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes)
  const indicesToDelete = [...pageIndices].sort((a, b) => b - a)
  indicesToDelete.forEach((i) => pdfDoc.removePage(i))
  return pdfDoc.save()
}

export async function mergePDFs(pdfsBytes: ArrayBuffer[]): Promise<Uint8Array> {
  const mergedDoc = await PDFDocument.create()
  for (const pdfBytes of pdfsBytes) {
    const doc = await PDFDocument.load(pdfBytes)
    const pages = await mergedDoc.copyPages(doc, doc.getPageIndices())
    pages.forEach((page) => mergedDoc.addPage(page))
  }
  return mergedDoc.save()
}

export async function splitPDF(
  pdfBytes: ArrayBuffer,
  pageIndex: number
): Promise<[Uint8Array, Uint8Array]> {
  const srcDoc = await PDFDocument.load(pdfBytes)
  const totalPages = srcDoc.getPageCount()

  const part1 = await PDFDocument.create()
  const pages1 = await part1.copyPages(srcDoc, Array.from({ length: pageIndex }, (_, i) => i))
  pages1.forEach((p) => part1.addPage(p))

  const part2 = await PDFDocument.create()
  const pages2 = await part2.copyPages(
    srcDoc,
    Array.from({ length: totalPages - pageIndex }, (_, i) => i + pageIndex)
  )
  pages2.forEach((p) => part2.addPage(p))

  return [await part1.save(), await part2.save()]
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
