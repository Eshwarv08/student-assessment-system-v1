export async function downloadBookletAsPdf(bookletClass: string, filename: string): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import('jspdf'),
    import('html2canvas'),
  ]);

  const booklet = document.querySelector(`.${bookletClass}`) as HTMLElement | null;
  if (!booklet) { window.print(); return; }

  // If the booklet lives inside a hidden ancestor (e.g. submitted state in AssessmentForm),
  // temporarily move it off-screen so html2canvas can measure and render it.
  let hiddenEl: HTMLElement | null = null;
  let el: HTMLElement | null = booklet.parentElement;
  for (let i = 0; i < 6; i++) {
    if (!el) break;
    if (getComputedStyle(el).display === 'none') {
      hiddenEl = el;
      break;
    }
    el = el.parentElement;
  }

  if (hiddenEl) {
    hiddenEl.style.position = 'fixed';
    hiddenEl.style.left = '-99999px';
    hiddenEl.style.display = 'block';
  }

  const pages = Array.from(booklet.querySelectorAll<HTMLElement>('.page'));

  if (pages.length === 0) {
    if (hiddenEl) {
      hiddenEl.style.position = '';
      hiddenEl.style.left = '';
      hiddenEl.style.display = '';
    }
    window.print();
    return;
  }

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();
    const canvas = await html2canvas(pages[i], {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.95), 'JPEG', 0, 0, 210, 297);
  }

  if (hiddenEl) {
    hiddenEl.style.position = '';
    hiddenEl.style.left = '';
    hiddenEl.style.display = '';
  }

  pdf.save(filename);
}
