import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

export async function generateActaDocx(data, templateName = 'acta_prestamo.docx') {
  try {
    // Load the template file from the public folder
    const response = await fetch(`/${templateName}`);
    if (!response.ok) {
      throw new Error(`No se pudo cargar la plantilla: ${response.statusText}`);
    }
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    // Load the zip
    const zip = new PizZip(arrayBuffer);

    // Initialize docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Render the document with the data
    doc.render(data);

    // Generate the blob
    const out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // Save the file
    const prefix = templateName.includes('prestamo') ? 'Acta_Prestamo' : 'Acta_Entrega';
    const fileName = `${prefix}_${data.solicitante_nombre.replace(/\s+/g, '_')}_${new Date().getTime()}.docx`;
    saveAs(out, fileName);
    
    return { success: true };
  } catch (error) {
    console.error('Error al generar el documento DOCX:', error);
    let errorMessage = error.message;

    // docxtemplater specific error handling for "Multi error"
    if (error.properties && error.properties.errors instanceof Array) {
      const errorMessages = error.properties.errors.map(function (err) {
        return err.properties.explanation || err.message;
      }).join(" | ");
      errorMessage = `Error en la plantilla Word: ${errorMessages}`;
    }

    return { success: false, error: errorMessage };
  }
}
