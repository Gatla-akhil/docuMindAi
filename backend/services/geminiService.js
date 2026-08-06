const { GoogleGenerativeAI } = require('@google/generative-ai');

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

/**
 * Fallback regex extractor for common document entities
 */
const extractEntitiesRegex = (text) => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
  const panRegex = /[A-Z]{5}[0-9]{4}[A-Z]{1}/g;
  const gstRegex = /\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/g;
  const amountRegex = /(?:Rs\.?|\$|€|£|INR)\s*[\d,]+(?:\.\d{2})?/gi;
  const dateRegex = /\b(?:\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4}|\d{4}[\/\.-]\d{1,2}[\/\.-]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4})\b/gi;
  const invoiceRegex = /\b(?:INV|INVOICE|BILL|REF|NO)[-:\s#]*([A-Z0-9-]+)\b/gi;

  const emails = [...new Set(text.match(emailRegex) || [])];
  const phoneNumbers = [...new Set(text.match(phoneRegex) || [])];
  const panNumbers = [...new Set(text.match(panRegex) || [])];
  const gstNumbers = [...new Set(text.match(gstRegex) || [])];
  const amounts = [...new Set(text.match(amountRegex) || [])];
  const dates = [...new Set(text.match(dateRegex) || [])];
  
  const invoiceMatches = [];
  let match;
  while ((match = invoiceRegex.exec(text)) !== null) {
    if (match[1] && match[1].length > 3) invoiceMatches.push(match[1]);
  }

  // Basic name heuristic
  const names = [];
  const nameLines = text.split('\n').filter(line => /Name:\s*([A-Za-z\s]+)/i.test(line));
  nameLines.forEach(l => {
    const m = l.match(/Name:\s*([A-Za-z\s]+)/i);
    if (m && m[1]) names.push(m[1].trim());
  });

  return {
    names,
    emails,
    phoneNumbers,
    addresses: [],
    dates,
    invoiceNumbers: [...new Set(invoiceMatches)],
    gstNumbers,
    panNumbers,
    amounts,
    tables: []
  };
};

/**
 * Perform comprehensive document analysis with Gemini AI
 */
const analyzeDocumentWithGemini = async (documentText, fileCategory = 'General') => {
  const genAI = getGeminiClient();
  const truncatedText = documentText.slice(0, 15000); // Safe token window

  // If no Gemini key or empty text, fallback to regex + heuristics
  if (!genAI || !truncatedText) {
    console.log('[Gemini Service]: API key not set or empty text. Running heuristic parsing fallback.');
    const regexEntities = extractEntitiesRegex(truncatedText);
    return {
      summary: truncatedText ? `Document summary based on extracted text (${truncatedText.split(/\s+/).length} words). Key information includes contact details, transaction records, and structured identifiers.` : 'No text content extracted to summarize.',
      keywords: ['Document', 'Extraction', fileCategory, 'Text Analysis'],
      classification: {
        category: fileCategory !== 'General' ? fileCategory : 'Report',
        confidence: 0.85,
        sentiment: 'Neutral'
      },
      extractedEntities: regexEntities,
      riskFlags: [
        {
          severity: 'Low',
          issue: 'Automated Processing Notice',
          description: 'Document processed with local heuristic fallback engine.'
        }
      ]
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
You are an expert Intelligent Document Processing (IDP) system. Analyze the following document text and return ONLY a valid JSON object matching this exact schema:

{
  "summary": "Concise summary of the document (3-4 sentences)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "classification": {
    "category": "Invoice" | "Receipt" | "Contract" | "Tax Document" | "Identity ID" | "Report" | "General",
    "confidence": 0.95,
    "sentiment": "Positive" | "Neutral" | "Negative" | "Risk Detected"
  },
  "extractedEntities": {
    "names": ["Name 1"],
    "emails": ["email@example.com"],
    "phoneNumbers": ["+1234567890"],
    "addresses": ["Full Address"],
    "dates": ["YYYY-MM-DD or string date"],
    "invoiceNumbers": ["INV-1001"],
    "gstNumbers": ["22AAAAA0000A1Z5"],
    "panNumbers": ["ABCDE1234F"],
    "amounts": ["$1,500.00"],
    "tables": [
      {
        "title": "Table Name",
        "headers": ["Item", "Qty", "Price", "Total"],
        "rows": [["Item A", "2", "$50", "$100"]]
      }
    ]
  },
  "riskFlags": [
    {
      "severity": "High" | "Medium" | "Low",
      "issue": "Brief issue title",
      "description": "Explanation of potential compliance, missing field, or financial risk"
    }
  ]
}

DOCUMENT TEXT:
"""
${truncatedText}
"""
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Clean response markup if present
    const jsonString = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonString);

    return parsed;
  } catch (error) {
    console.error(`[Gemini AI Error]: ${error.message}. Returning robust fallback analysis.`);
    const regexEntities = extractEntitiesRegex(truncatedText);
    return {
      summary: truncatedText.slice(0, 300) + '...',
      keywords: ['Document', 'Extracted', fileCategory],
      classification: {
        category: fileCategory,
        confidence: 0.8,
        sentiment: 'Neutral'
      },
      extractedEntities: regexEntities,
      riskFlags: [
        {
          severity: 'Medium',
          issue: 'AI Parsing Fallback',
          description: 'AI model temporarily unavailable; used rule-based entity extraction.'
        }
      ]
    };
  }
};

/**
 * Answer questions about a document using Gemini RAG
 */
const answerDocumentQuestion = async (documentText, question, chatHistory = []) => {
  const genAI = getGeminiClient();
  const truncatedText = documentText.slice(0, 15000);

  if (!genAI) {
    // Smart heuristic Q&A fallback when offline/no key
    const lowerQ = question.toLowerCase();
    if (lowerQ.includes('summary') || lowerQ.includes('about')) {
      return `This document contains ${truncatedText.split(/\s+/).length} words. It features information regarding transaction details, dates, and extracted key entities.`;
    }
    if (lowerQ.includes('email') || lowerQ.includes('contact')) {
      const emails = extractEntitiesRegex(truncatedText).emails;
      return emails.length ? `Found contact emails: ${emails.join(', ')}` : 'No email addresses were found in this document.';
    }
    if (lowerQ.includes('amount') || lowerQ.includes('total') || lowerQ.includes('price')) {
      const amounts = extractEntitiesRegex(truncatedText).amounts;
      return amounts.length ? `Extracted financial amounts: ${amounts.join(', ')}` : 'No financial amounts were identified in this document.';
    }
    return `Based on the document context: "${truncatedText.slice(0, 400)}..." (Note: Configure GEMINI_API_KEY in backend/.env for deep multi-turn AI reasoning).`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const formattedHistory = chatHistory
      .slice(-6)
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join('\n');

    const prompt = `
You are an expert AI assistant answering questions based strictly on the provided document context.

DOCUMENT CONTEXT:
"""
${truncatedText}
"""

CONVERSATION HISTORY:
${formattedHistory}

USER QUESTION:
${question}

Instructions:
1. Answer directly and concisely based on the document text.
2. If the information is not present in the document, explicitly state that it cannot be found in the document.
3. Highlight key numbers, dates, or terms in bold when helpful.
`;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error(`[Gemini Q&A Error]: ${error.message}`);
    return `I encountered an issue processing your request via the AI model. Document Context Snippet: "${truncatedText.slice(0, 200)}..."`;
  }
};

module.exports = {
  analyzeDocumentWithGemini,
  answerDocumentQuestion,
  extractEntitiesRegex
};
