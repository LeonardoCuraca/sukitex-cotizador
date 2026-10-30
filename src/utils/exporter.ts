import { toCanvas, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

function sanitizeFileName(raw: string): string {
  return raw
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

export function buildExportFileName(quoteNumber: string, clientName: string, ext: 'pdf' | 'png' | 'json'): string {
  const num = sanitizeFileName(quoteNumber || 'COT');
  const client = sanitizeFileName(clientName || 'Cliente').slice(0, 35);
  return `SUKITEX_${num}_${client || 'Cotizacion'}.${ext}`;
}

export async function exportElementAsPng(
  element: HTMLElement,
  quoteNumber: string,
  clientName: string
): Promise<void> {
  const dataUrl = await toPng(element, {
    quality: 1,
    pixelRatio: 2.5,
    backgroundColor: '#ffffff',
    cacheBust: true,
  });

  const link = document.createElement('a');
  link.download = buildExportFileName(quoteNumber, clientName, 'png');
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function exportElementAsPdf(
  element: HTMLElement,
  quoteNumber: string,
  clientName: string
): Promise<void> {
  const canvas = await toCanvas(element, {
    pixelRatio: 2.5,
    backgroundColor: '#ffffff',
    cacheBust: true,
  });

  const imgData = canvas.toDataURL('image/png', 1.0);
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  });

  const pageWidthMm = 210;
  const pageHeightMm = 297;

  const imgWidthMm = pageWidthMm;
  const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

  // If the content is within 108% of a single A4 page, scale it gently to fit 1 single A4 page cleanly
  if (imgHeightMm <= pageHeightMm * 1.08) {
    const scale = Math.min(1, pageHeightMm / imgHeightMm);
    const finalW = imgWidthMm * scale;
    const finalH = imgHeightMm * scale;
    const offsetX = (pageWidthMm - finalW) / 2;
    pdf.addImage(imgData, 'PNG', offsetX, 0, finalW, finalH, undefined, 'FAST');
  } else {
    // Multi-page A4 slicing
    let heightLeft = imgHeightMm;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidthMm, imgHeightMm, undefined, 'FAST');
    heightLeft -= pageHeightMm;

    while (heightLeft > 4) {
      position = heightLeft - imgHeightMm;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidthMm, imgHeightMm, undefined, 'FAST');
      heightLeft -= pageHeightMm;
    }
  }

  pdf.save(buildExportFileName(quoteNumber, clientName, 'pdf'));
}
