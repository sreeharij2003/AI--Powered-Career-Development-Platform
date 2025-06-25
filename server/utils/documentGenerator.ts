import { Buffer } from 'buffer';
import docx from 'docx';
import PDFDocument from 'pdfkit';

const { Document, Paragraph, TextRun, Packer } = docx;

export const generatePDF = async (content: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Add content to PDF
      doc.fontSize(12);
      doc.text(content, {
        align: 'left',
        lineGap: 5
      });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

export const generateDOCX = async (content: string): Promise<Buffer> => {
  try {
    // Split content into paragraphs
    const paragraphs = content.split('\n\n').map(text => 
      new Paragraph({
        children: [
          new TextRun({
            text: text.trim(),
            size: 24 // 12pt
          })
        ]
      })
    );

    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });

    return await Packer.toBuffer(doc);
  } catch (error) {
    throw new Error('Failed to generate DOCX document');
  }
}; 