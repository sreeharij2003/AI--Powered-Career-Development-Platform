import { Buffer } from 'buffer';
import docx from 'docx';
import PDFDocument from 'pdfkit';

const { Document, Paragraph, TextRun, Packer } = docx;

interface ResumeData {
  contact?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    address?: string;
    website?: string;
  };
  summary?: string;
  experience?: Array<{
    id?: string;
    title?: string;
    company?: string;
    duration?: string;
    responsibilities?: string;
    location?: string;
    achievements?: string;
  }>;
  education?: Array<{
    id?: string;
    degree?: string;
    major?: string;
    institution?: string;
    year?: string;
    gpa?: string;
    details?: string;
  }>;
  skills?: Array<{
    id?: string;
    name?: string;
    category?: string;
    proficiency?: string;
  }> | string[];
  projects?: Array<{
    id?: string;
    title?: string;
    description?: string;
    technologies?: string;
    duration?: string;
    link?: string;
  }>;
  certifications?: Array<{
    id?: string;
    name?: string;
    organization?: string;
    date?: string;
    details?: string;
  }>;
  languages?: Array<{
    id?: string;
    name?: string;
    proficiency?: string;
  }>;
  interests?: string[];
}

export const generatePDF = async (content: string): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
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

export const generateTemplatedResumePDF = async (resumeData: ResumeData, template: string = 'template1'): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50
        }
      });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Apply template-specific styling
      switch (template) {
        case 'template1':
          generateTemplate1(doc, resumeData);
          break;
        case 'template2':
          generateTemplate2(doc, resumeData);
          break;
        case 'template3':
          generateTemplate3(doc, resumeData);
          break;
        default:
          generateTemplate1(doc, resumeData);
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// Template 1: Professional Classic
const generateTemplate1 = (doc: PDFDocument, resumeData: ResumeData) => {
  const pageWidth = doc.page.width - 100; // Account for margins
  let yPosition = 50;

  // Header with name and contact
  if (resumeData.contact) {
    const fullName = `${resumeData.contact.firstName || ''} ${resumeData.contact.lastName || ''}`.trim();
    if (fullName) {
      doc.fontSize(24).font('Helvetica-Bold');
      doc.text(fullName, 50, yPosition, { align: 'center' });
      yPosition += 35;
    }

    // Contact information
    const contactInfo = [];
    if (resumeData.contact.email) contactInfo.push(resumeData.contact.email);
    if (resumeData.contact.phone) contactInfo.push(resumeData.contact.phone);
    if (resumeData.contact.linkedin) contactInfo.push(resumeData.contact.linkedin);
    if (resumeData.contact.address) contactInfo.push(resumeData.contact.address);

    if (contactInfo.length > 0) {
      doc.fontSize(10).font('Helvetica');
      doc.text(contactInfo.join(' | '), 50, yPosition, { align: 'center' });
      yPosition += 25;
    }

    // Horizontal line
    doc.moveTo(50, yPosition).lineTo(pageWidth + 50, yPosition).stroke();
    yPosition += 20;
  }

  // Professional Summary
  if (resumeData.summary) {
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('PROFESSIONAL SUMMARY', 50, yPosition);
    yPosition += 20;

    doc.fontSize(11).font('Helvetica');
    doc.text(resumeData.summary, 50, yPosition, {
      width: pageWidth,
      align: 'justify'
    });
    yPosition += doc.heightOfString(resumeData.summary, { width: pageWidth }) + 20;
  }

  // Skills
  if (resumeData.skills && resumeData.skills.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('CORE COMPETENCIES', 50, yPosition);
    yPosition += 20;

    const skillsText = Array.isArray(resumeData.skills)
      ? resumeData.skills.map(skill => typeof skill === 'string' ? skill : skill.name).join(' • ')
      : resumeData.skills.join(' • ');

    doc.fontSize(11).font('Helvetica');
    doc.text(skillsText, 50, yPosition, { width: pageWidth });
    yPosition += doc.heightOfString(skillsText, { width: pageWidth }) + 20;
  }

  // Experience
  if (resumeData.experience && resumeData.experience.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('PROFESSIONAL EXPERIENCE', 50, yPosition);
    yPosition += 20;

    resumeData.experience.forEach((exp) => {
      // Job title and company
      const titleCompany = `${exp.title || ''} - ${exp.company || ''}`.replace(' - ', ' ');
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(titleCompany, 50, yPosition);
      yPosition += 15;

      // Duration and location
      if (exp.duration || exp.location) {
        const durationLocation = [exp.duration, exp.location].filter(Boolean).join(' | ');
        doc.fontSize(10).font('Helvetica-Oblique');
        doc.text(durationLocation, 50, yPosition);
        yPosition += 15;
      }

      // Responsibilities
      if (exp.responsibilities) {
        doc.fontSize(11).font('Helvetica');
        doc.text(exp.responsibilities, 50, yPosition, {
          width: pageWidth,
          align: 'justify'
        });
        yPosition += doc.heightOfString(exp.responsibilities, { width: pageWidth }) + 15;
      }

      yPosition += 10; // Space between experiences
    });
  }

  // Projects
  if (resumeData.projects && resumeData.projects.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('KEY PROJECTS', 50, yPosition);
    yPosition += 20;

    resumeData.projects.forEach((project) => {
      // Project title
      if (project.title) {
        doc.fontSize(12).font('Helvetica-Bold');
        doc.text(project.title, 50, yPosition);
        yPosition += 15;
      }

      // Technologies
      if (project.technologies) {
        doc.fontSize(10).font('Helvetica-Oblique');
        doc.text(`Technologies: ${project.technologies}`, 50, yPosition);
        yPosition += 12;
      }

      // Description
      if (project.description) {
        doc.fontSize(11).font('Helvetica');
        doc.text(project.description, 50, yPosition, {
          width: pageWidth,
          align: 'justify'
        });
        yPosition += doc.heightOfString(project.description, { width: pageWidth }) + 15;
      }

      yPosition += 10; // Space between projects
    });
  }

  // Education
  if (resumeData.education && resumeData.education.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('EDUCATION', 50, yPosition);
    yPosition += 20;

    resumeData.education.forEach((edu) => {
      const degreeInstitution = `${edu.degree || ''} - ${edu.institution || ''}`.replace(' - ', ' ');
      doc.fontSize(12).font('Helvetica-Bold');
      doc.text(degreeInstitution, 50, yPosition);
      yPosition += 15;

      if (edu.year) {
        doc.fontSize(10).font('Helvetica-Oblique');
        doc.text(edu.year, 50, yPosition);
        yPosition += 12;
      }

      if (edu.gpa) {
        doc.fontSize(10).font('Helvetica');
        doc.text(`GPA: ${edu.gpa}`, 50, yPosition);
        yPosition += 12;
      }

      yPosition += 10; // Space between education entries
    });
  }

  // Certifications
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    doc.fontSize(14).font('Helvetica-Bold');
    doc.text('CERTIFICATIONS', 50, yPosition);
    yPosition += 20;

    resumeData.certifications.forEach((cert) => {
      const certText = `${cert.name || ''} - ${cert.organization || ''} (${cert.date || ''})`;
      doc.fontSize(11).font('Helvetica');
      doc.text(certText, 50, yPosition);
      yPosition += 15;
    });
  }
};

// Template 2: Modern Clean (simplified version)
const generateTemplate2 = (doc: PDFDocument, resumeData: ResumeData) => {
  // Similar structure but with different styling
  generateTemplate1(doc, resumeData); // For now, use template1 as base
};

// Template 3: Creative Bold (simplified version)
const generateTemplate3 = (doc: PDFDocument, resumeData: ResumeData) => {
  // Similar structure but with different styling
  generateTemplate1(doc, resumeData); // For now, use template1 as base
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