const PDFDocument = require('pdfkit');
const fs = require('fs');

const generateComplaintPDF = (complaint, user, hr) => {
  const doc = new PDFDocument();
  const fileName = `complaint-${complaint._id}.pdf`;
  const filePath = `uploads/pdfs/${fileName}`;
  
  // Pipe the PDF to a file
  doc.pipe(fs.createWriteStream(filePath));
  
  // Add content to the PDF
  doc.fontSize(20).text('Harassment Complaint Report', { align: 'center' });
  doc.moveDown();
  
  doc.fontSize(14).text(`Complaint ID: ${complaint._id}`);
  doc.text(`Title: ${complaint.title}`);
  doc.text(`Status: ${complaint.status}`);
  doc.moveDown();
  
  doc.fontSize(16).text('Complainant Details', { underline: true });
  if (complaint.isAnonymous) {
    doc.text('Name: Anonymous');
  } else {
    doc.text(`Name: ${user.name}`);
  }
  doc.text(`Email: ${user.email}`);
  doc.text(`Phone: ${user.phone}`);
  doc.moveDown();
  
  doc.fontSize(16).text('Incident Details', { underline: true });
  doc.text(`Perpetrator Name: ${complaint.perpetratorName}`);
  doc.text(`Perpetrator Details: ${complaint.perpetratorDetails}`);
  doc.text(`Incident Date: ${complaint.incidentDate.toDateString()}`);
  doc.text(`Incident Location: ${complaint.incidentLocation}`);
  doc.moveDown();
  
  doc.fontSize(16).text('Description', { underline: true });
  doc.text(complaint.description);
  doc.moveDown();
  
  doc.fontSize(16).text('Assigned HR/NGO', { underline: true });
  doc.text(`Organization: ${hr.organization}`);
  doc.text(`Department: ${hr.department}`);
  doc.text(`Contact Person: ${hr.position}`);
  doc.text(`NGO: ${hr.isNGO ? 'Yes' : 'No'}`);
  
  // Finalize the PDF
  doc.end();
  
  return filePath;
};

module.exports = { generateComplaintPDF };