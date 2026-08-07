const fs = require('fs');
const { transcribeVideoOrAudioWithGemini } = require('../services/geminiService');

/**
 * Transcribe meeting video or audio file
 */
const transcribeAudio = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No audio or video file uploaded' });
    }

    const { path: filePath, mimetype, originalname } = req.file;
    const customNotes = req.body.notes || req.body.meetingNotes || '';

    const transcript = await transcribeVideoOrAudioWithGemini(
      filePath,
      mimetype,
      customNotes,
      originalname
    );

    return res.status(200).json({
      success: true,
      message: 'Audio transcribed successfully',
      transcript,
      text: transcript
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    next(error);
  }
};

module.exports = {
  transcribeAudio
};
