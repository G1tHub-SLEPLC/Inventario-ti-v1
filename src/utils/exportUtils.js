import Papa from 'papaparse';

/**
 * Exporta datos a EXCEL, PDF o CSV
 * @param {string} format - 'xlsx', 'pdf', o 'csv'
 * @param {Array} baseData - Arreglo de objetos con los datos a exportar
 * @param {Array} columns - Lista de strings con los nombres de las columnas a incluir
 * @param {string} title - Título del documento (ej. 'Reporte de Insumos')
 * @param {string} baseName - Nombre base del archivo (ej. 'insumos_reporte')
 * @param {Function} rowFormatter - Función opcional para mapear cada fila: (row, cols) => {}
 */
export async function exportToExcelAndPDF(format, baseData, columns, title, baseName, rowFormatter = null) {
  if (!baseData || baseData.length === 0) {
    alert('No hay datos para exportar.');
    return;
  }

  const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
  const fileName = `${baseName}_${stamp}`;

  // Formato por defecto si no se provee
  const defaultRowFormatter = (r, cols) => {
    const obj = {};
    cols.forEach(c => obj[c] = (r[c] === null || r[c] === undefined) ? '—' : String(r[c]));
    return obj;
  };
  
  const formatter = rowFormatter || defaultRowFormatter;

  if (format === 'xlsx') {
    const { Workbook } = await import('exceljs');
    const { saveAs } = await import('file-saver');
    const wb = new Workbook();
    const ws = wb.addWorksheet(title.substring(0, 31)); // Excel tab names max 31 chars
    
    // Configuración de página para tablas anchas (Oficio Chile + Horizontal)
    if (columns.length > 5) {
      ws.pageSetup.orientation = 'landscape';
      ws.pageSetup.paperSize = 14; // 14 representa el formato Folio/Oficio (8.5 x 13)
    }
    
    ws.columns = columns.map(c => ({
      header: c.toUpperCase(),
      key: c,
      width: Math.max(c.length + 5, 20)
    }));

    const headerRow = ws.getRow(1);
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006BB9' } };
      cell.font = { color: { argb: 'FFFFFFFF' }, bold: true, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
    headerRow.height = 25;

    baseData.forEach((r, i) => {
      const rowData = formatter(r, columns);
      const row = ws.addRow(rowData);
      
      if (i % 2 !== 0) {
         row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } }; });
      }

      row.eachCell((cell) => {
        cell.font = { size: 11, color: { argb: 'FF374151' } };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
      row.height = 20;
    });

    const buffer = await wb.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), fileName + '.xlsx');

  } else if (format === 'pdf') {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    // Usa orientación horizontal ('landscape') y tamaño Oficio Chile si hay muchas columnas
    const isWide = columns.length > 5;
    const orientation = isWide ? 'landscape' : 'portrait';
    const paperSize = isWide ? [612, 936] : 'a4'; // 612x936 pt equivale a Oficio Chile / Folio (8.5 x 13 in)
    const doc = new jsPDF(orientation, 'pt', paperSize);
    
    const tableRows = baseData.map(r => {
      const obj = formatter(r, columns);
      return columns.map(c => obj[c]);
    });

    doc.setFontSize(16);
    doc.setTextColor(37, 48, 107);
    doc.text(title, 40, 40);

    autoTable(doc, {
      head: [columns.map(c => c.toUpperCase())],
      body: tableRows,
      startY: 60,
      styles: { fontSize: 8, font: 'helvetica', cellPadding: 6, textColor: [55, 65, 81] },
      headStyles: { fillColor: [0, 107, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });
    
    doc.save(fileName + '.pdf');

  } else if (format === 'csv') {
    const exportRows = baseData.map(r => formatter(r, columns));
    const csv = Papa.unparse(exportRows);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
