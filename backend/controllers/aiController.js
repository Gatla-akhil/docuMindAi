const { getGeminiClient, translateDocumentText, generateSmartSummary } = require('../services/geminiService');

/**
 * Translate text into target language
 */
const translate = async (req, res, next) => {
  try {
    const { text, language, targetLanguage } = req.body;
    const target = language || targetLanguage || 'English';

    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required for translation' });
    }

    const genAI = getGeminiClient();
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Translate the following text accurately into ${target}. Return ONLY the translated text:\n\n${text}`;
        const result = await model.generateContent(prompt);
        const translatedText = result.response.text().trim();
        return res.status(200).json({
          success: true,
          translatedText,
          text: translatedText
        });
      } catch (err) {
        console.warn(`[Gemini Translate Notice]: ${err.message}`);
      }
    }

    const fallback = await translateDocumentText(text, '', target);
    return res.status(200).json({
      success: true,
      translatedText: fallback.translatedText || text,
      text: fallback.translatedText || text
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate Executive AI Summary
 */
const summary = async (req, res, next) => {
  try {
    const { text, category } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required for summary generation' });
    }

    const genAI = getGeminiClient();
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Provide a detailed 3-4 sentence summary of the following document:\n\n${text}`;
        const result = await model.generateContent(prompt);
        const summaryText = result.response.text().trim();
        return res.status(200).json({
          success: true,
          summary: summaryText
        });
      } catch (err) {
        console.warn(`[Gemini Summary Notice]: ${err.message}`);
      }
    }

    const smartSummary = generateSmartSummary(text, category || 'General');
    return res.status(200).json({
      success: true,
      summary: smartSummary
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Convert text into structured bullet points
 */
const bullets = async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required for bullet points conversion' });
    }

    const genAI = getGeminiClient();
    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const prompt = `Convert the following text into key structured bullet points with emojis:\n\n${text}`;
        const result = await model.generateContent(prompt);
        const bulletText = result.response.text().trim();
        return res.status(200).json({
          success: true,
          bullets: bulletText
        });
      } catch (err) {
        console.warn(`[Gemini Bullets Notice]: ${err.message}`);
      }
    }

    const lines = text.split(/(?<=[.!?])\s+|\n+/).filter(l => l.trim().length > 10).slice(0, 5);
    const fallbackBullets = lines.map((l, i) => `• Point ${i + 1}: ${l.trim()}`).join('\n');
    return res.status(200).json({
      success: true,
      bullets: fallbackBullets || `• ${text.slice(0, 200)}`
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  translate,
  summary,
  bullets
};
