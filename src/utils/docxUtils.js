import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';

export async function generateActaDocx(data, templateName = 'acta_template.docx') {
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
    const fileName = `Acta_Entrega_${data.solicitante_nombre.replace(/\s+/g, '_')}_${new Date().getTime()}.docx`;
    saveAs(out, fileName);
    
    return { success: true };
  } catch (error) {
    console.error('Error al generar el documento DOCX:', error);
    return { success: false, error: error.message };
  }
}
