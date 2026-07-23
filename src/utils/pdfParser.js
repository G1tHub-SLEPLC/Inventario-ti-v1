import * as pdfjsLib from 'pdfjs-dist';

// Use a reliable CDN for the worker to avoid Vite build issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

function normalize(text) {
  if (!text) return '';
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

export async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let lines = [];
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    // Sort items by Y, then by X to approximate lines
    const items = textContent.items.map(item => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5]
    }));
    
    items.sort((a, b) => {
      if (Math.abs(b.y - a.y) > 5) return b.y - a.y; // Sort by Y descending
      return a.x - b.x; // Sort by X ascending
    });

    let currentY = null;
    let currentLine = [];
    items.forEach(item => {
      if (currentY === null || Math.abs(currentY - item.y) > 5) {
        if (currentLine.length > 0) lines.push(currentLine.join(' '));
        currentLine = [item.str.trim()];
        currentY = item.y;
      } else {
        currentLine.push(item.str.trim());
      }
    });
    if (currentLine.length > 0) lines.push(currentLine.join(' '));
    
    // Also store raw items for spatial column parsing later
    if (!file._rawItems) file._rawItems = [];
    file._rawItems.push(...items);
  }
  return lines;
}

export async function parseOrdenCompra(file, { marca, modelo, descripcion }) {
  const lines = await extractTextFromPDF(file);
  const fullText = lines.join(' ');
  const normText = normalize(fullText);

  let nombreOC = '';
  const codeMatch = fullText.match(/ORDEN DE COMPRA\s*(?:N[°º]?|NRO\.?|N[UÚ]MERO)?\s*[:|-]?\s*([A-Z0-9-]+-[A-Z0-9-]+-[A-Z0-9]+)/i) || fullText.match(/ORDEN DE COMPRA\s*(?:N[°º]?|NRO\.?|N[UÚ]MERO)?\s*[:|-]?\s*([A-Z0-9-]+)/i);
  if (codeMatch) {
    nombreOC = codeMatch[1].trim().toUpperCase();
  }
  
  if (!nombreOC) {
    const nombreMatch = fullText.match(/NOMBRE ORDEN DE COMPRA\s*[:|-]?\s*(.*?)(?=\s\s|$|FECHA ENTREGA)/i);
    if (nombreMatch) {
      nombreOC = nombreMatch[1].trim();
    }
  }

  let proveedor = '';
  const proveedorMatch = fullText.match(/SEÑOR\s*\(ES\)\s*:\s*(.*?)(?=\s\s|$|RUT\s*:)/i);
  if (proveedorMatch) {
    proveedor = proveedorMatch[1].trim();
  }

  let convenioMarco = '';
  let isConvenioMarco = false;
  // Buscar "(12345-xx-xx26)" o similar cerca de ESPECIFICACIONES
  const cmMatch = fullText.match(/(?:ESPECIFICACIONES(?:.*?)COMPRADOR|ESPECIFICACIONES(?:.*?)PROVEEDOR)[^()]*\(([^)]+)\)/i);
  if (cmMatch) {
    convenioMarco = cmMatch[1].trim();
    isConvenioMarco = true;
  } else {
    // Buscar cualquier patron (xxxx-xx-xxxx) que parezca convenio marco o licitacion
    const fallbackCmMatch = fullText.match(/\b([A-Z0-9]+-\d+-[A-Z0-9]+)\b/i);
    if (fallbackCmMatch) {
      convenioMarco = fallbackCmMatch[1].toUpperCase();
    }
  }

  // Heurística 1: Búsqueda espacial por Columnas (Mercado Público)
  let bestQuantity = 0;
  if (file._rawItems && file._rawItems.length > 0) {
    const rawItems = file._rawItems;
    // Encontrar el encabezado "Cantidad"
    const cantidadHeader = rawItems.find(item => {
      const s = item.str.trim().toLowerCase();
      return s === 'cantidad' || s === 'cantidad /' || s === 'cantidad / unidad' || s.startsWith('cantidad');
    });
    
    if (cantidadHeader) {
      // Definir los límites de la columna X (con tolerancia)
      const colXMin = cantidadHeader.x - 15;
      const colXMax = cantidadHeader.x + 30;
      
      // Buscar items que caigan bajo esta columna (menor Y) y sean números
      const columnItems = rawItems.filter(item => 
        item.y < cantidadHeader.y && // Debajo del encabezado
        item.x >= colXMin && item.x <= colXMax && // En la misma columna X
        /^\d+(\s*(unidades|unidad|u|un|equipos|productos))?$/i.test(item.str.trim()) // Es un número (puede tener sufijo)
      );
      
      // Ordenar de arriba hacia abajo (mayor Y a menor Y)
      columnItems.sort((a, b) => b.y - a.y);
      
      if (columnItems.length > 0) {
        const parsedQty = parseInt(columnItems[0].str.trim(), 10);
        if (parsedQty > 0) {
          bestQuantity = parsedQty;
        }
      }
    }
  }

  // Heurística 2: Búsqueda por proximidad de palabras clave (Fallback)
  const keywords = [marca, modelo, descripcion, nombreOC].filter(Boolean).map(normalize);
  
  if (bestQuantity === 0 && keywords.length > 0) {
    let maxMatches = 0;
    
    // Agrupar lineas en bloques para tener contexto
    for (let i = 0; i < lines.length; i++) {
      const block = [lines[i-1], lines[i], lines[i+1]].filter(Boolean).join(' ');
      const normBlock = normalize(block);
      
      let matchCount = 0;
      keywords.forEach(kw => {
        if (kw && normBlock.includes(kw)) matchCount++;
      });
      
      if (matchCount > 0 && matchCount >= maxMatches) {
        maxMatches = matchCount;
        
        // Tratar de encontrar una cantidad en esa misma línea
        // Ejemplo: "10 UN" o un numero suelto al inicio de la linea (como en las tablas)
        // Se asegura de que el número esté verdaderamente aislado o con su sufijo, ignorando RUTs (76.x) o precios (100,50)
        const qtyMatch = lines[i].match(/(?:^|\s)(\d+)(?:\s+(?:UN|Unidad|Equipos|Productos|U|CT|CANTIDAD))?(?=\s|$)/i);
        if (qtyMatch) {
          const num = parseInt(qtyMatch[1], 10);
          if (num > 0 && num < 5000) {
            bestQuantity = num;
          }
        }
      }
    }
  }

  if (bestQuantity === 0) {
    const qtyMatch = fullText.match(/CANTIDAD\s*[:|-]?\s*(\d+)/i);
    if (qtyMatch) bestQuantity = parseInt(qtyMatch[1], 10);
  }

  let tipoPublicacion = '';
  if (nombreOC) {
    if (nombreOC.includes('-CM')) tipoPublicacion = 'Convenio Marco';
    else if (nombreOC.includes('-AG')) tipoPublicacion = 'Compra Ágil';
    else if (nombreOC.match(/-(LE|LP|LQ|LR|LS)\d*$/i)) tipoPublicacion = 'Licitación';
    else if (nombreOC.match(/-(SE|DI)\d*$/i)) tipoPublicacion = 'Trato Directo';
  }
  
  if (isConvenioMarco && !tipoPublicacion) {
    tipoPublicacion = 'Convenio Marco';
  }

  return {
    nombreOC,
    convenioMarco,
    isConvenioMarco,
    tipoPublicacion,
    proveedor,
    cantidad: bestQuantity || 1
  };
}
