const { createWorker } = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');

/**
 * Preprocess image with sharp for enhanced OCR accuracy
 */
const preprocessImage = async (filePath) => {
  try {
    const processedBuffer = await sharp(filePath)
      .resize({ width: 2000, fit: 'inside', withoutEnlargement: true })
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();
    return processedBuffer;
  } catch (err) {
    console.warn(`[OCR Preprocess Warning]: Could not preprocess with Sharp (${err.message}). Using raw file buffer.`);
    try {
      return fs.readFileSync(filePath);
    } catch (e) {
      return null;
    }
  }
};

/**
 * Perform OCR on image file safely without crashing node process
 */
const performOCR = async (filePath) => {
  let worker = null;
  try {
    // Tesseract.js handles image files (PNG, JPG, TIFF, WEBP).
    // If passed a raw PDF, skip Tesseract to avoid pixReadStream crash
    if (filePath.toLowerCase().endsWith('.pdf')) {
      console.warn('[OCR Notice]: Direct PDF binary is not a bitmap image format for Tesseract. Skipping OCR fallback.');
      return '';
    }

    const buffer = await preprocessImage(filePath);
    if (!buffer) return '';

    worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    return text || '';
  } catch (error) {
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {}
    }
    console.error(`[OCR Safe Catch]: Tesseract OCR skipped (${error.message || error})`);
    return '';
  }
};

module.exports = {
  performOCR,
  preprocessImage
};
