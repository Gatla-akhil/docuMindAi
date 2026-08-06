const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { performOCR } = require('./ocrService');

/**
 * Extract raw text from uploaded document based on file type
 */
const parseDocument = async (filePath, mimeType) => {
  let text = '';
  let ocrApplied = false;

  try {
    if (mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text || '';
      
      // If extracted text from PDF is minimal (scanned PDF), apply OCR fallback
      if (text.trim().length < 50) {
        console.log('[Parser]: Scanned PDF detected, applying Tesseract OCR...');
        const ocrText = await performOCR(filePath);
        if (ocrText && ocrText.length > text.length) {
          text = ocrText;
          ocrApplied = true;
        }
      }
    } else if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      text = result.value || '';
    } else if (mimeType.startsWith('image/')) {
      text = await performOCR(filePath);
      ocrApplied = true;
    } else {
      // Fallback text reader
      text = fs.readFileSync(filePath, 'utf-8');
    }
  } catch (error) {
    console.error(`[Parser Error]: ${error.message}`);
    text = '';
  }

  return {
    text: text.trim(),
    ocrApplied
  };
};

module.exports = {
  parseDocument
};
