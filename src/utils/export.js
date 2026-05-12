import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportExcel(entries, monthLabel) {
  const rows = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => ({
      Tarih: e.date,
      'Ciro (₺)': e.ciro,
      'Satış Adedi': e.sales,
    }));

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, monthLabel);
  XLSX.writeFile(wb, `Ciro_${monthLabel}.xlsx`);
}

export function exportPDF(entries, monthLabel, totalCiro, totalSales) {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.setTextColor(29, 29, 31);
  doc.text(`Ciro Raporu`, 14, 20);

  doc.setFontSize(13);
  doc.setTextColor(110, 110, 115);
  doc.text(monthLabel, 14, 29);

  doc.setFontSize(11);
  doc.setTextColor(29, 29, 31);
  doc.text(`Toplam Ciro: ${totalCiro.toLocaleString('tr-TR')} ₺`, 14, 42);
  doc.text(`Toplam Satış: ${totalSales} adet`, 14, 50);
  doc.text(`Ortalama Günlük Ciro: ${entries.length > 0 ? Math.round(totalCiro / entries.length).toLocaleString('tr-TR') : 0} ₺`, 14, 58);

  const rows = [...entries]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(e => [e.date, `${Number(e.ciro).toLocaleString('tr-TR')} ₺`, `${e.sales} adet`]);

  autoTable(doc, {
    head: [['Tarih', 'Ciro', 'Satış Adedi']],
    body: rows,
    startY: 68,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 113, 227] },
  });

  doc.save(`Ciro_${monthLabel}.pdf`);
}
