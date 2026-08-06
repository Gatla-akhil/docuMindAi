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
    console.warn(`[OCR Preprocess Warning]: Could not preprocess image with Sharp, falling back to original file. ${err.message}`);
    return fs.readFileSync(filePath);
  }
};

/**
 * Perform OCR on image file
 */
const performOCR = async (filePath) => {
  let worker = null;
  try {
    const buffer = await preprocessImage(filePath);
    worker = await createWorker('eng');
    const { data: { text } } = await worker.recognize(buffer);
    await worker.terminate();
    return text || '';
  } catch (error) {
    if (worker) {
      await worker.terminate().catch(() => {});
    }
    console.error(`[OCR Error]: ${error.message}`);
    return '';
  }
};

module.exports = {
  performOCR,
  preprocessImage
};
