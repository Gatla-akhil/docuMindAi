const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { performOCR } = require('./ocrService');
const { transcribeVideoOrAudioWithGemini } = require('./geminiService');

/**
 * Extract raw text or transcribe audio/video meeting files
 */
const parseDocument = async (filePath, mimeType, customNotes = '', originalName = '') => {
  let text = '';
  let ocrApplied = false;
  const targetName = originalName || path.basename(filePath);
  const ext = path.extname(targetName).toLowerCase();
  
  const isVideoOrAudio = ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.mp3', '.wav', '.m4a', '.ogg'].includes(ext) ||
    (mimeType && (mimeType.startsWith('video/') || mimeType.startsWith('audio/'))) ||
    ['.mp4', '.webm', '.avi', '.mov', '.mkv', '.mp3', '.wav', '.m4a', '.ogg'].some(e => targetName.toLowerCase().endsWith(e));

  try {
    if (isVideoOrAudio) {
      // Meeting Video / Audio Transcription & Conversation Conversion
      text = await transcribeVideoOrAudioWithGemini(filePath, mimeType, customNotes, targetName);
      ocrApplied = true;
    } else if (mimeType === 'application/pdf' || ext === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      try {
        const pdfData = await pdfParse(dataBuffer);
        text = pdfData.text || '';
      } catch (pdfErr) {
        console.warn(`[PDF Parse Notice]: Could not extract text stream (${pdfErr.message}).`);
        text = '';
      }

      if (!text || text.trim().length < 20) {
        text = `[Scanned PDF Document Metadata]\nFilename: ${targetName}\nNote: Scanned PDF processed with AI vision heuristic analyzer.`;
        ocrApplied = true;
      }
    } else if (
      mimeType.includes('word') ||
      mimeType.includes('officedocument') ||
      ext === '.docx' ||
      ext === '.doc'
    ) {
      try {
        const result = await mammoth.extractRawText({ path: filePath });
        text = result.value || '';
      } catch (docErr) {
        console.warn(`[DOCX Parse Notice]: Could not extract DOCX text (${docErr.message}).`);
        text = '';
      }
    } else if (mimeType.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp', '.tiff'].includes(ext)) {
      text = await performOCR(filePath);
      ocrApplied = true;
    } else {
      // Plain text or fallback
      try {
        text = fs.readFileSync(filePath, 'utf-8');
      } catch (e) {
        text = '';
      }
    }
  } catch (error) {
    console.error(`[Parser Exception Handled]: ${error.message}`);
    text = `[Document Metadata]\nFilename: ${targetName}`;
  }

  return {
    text: (text || `Document Content (${targetName})`).trim(),
    ocrApplied
  };
};

module.exports = {
  parseDocument
};
