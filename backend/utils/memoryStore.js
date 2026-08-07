const crypto = require('crypto');
const bcrypt = require('bcryptjs');

// In-Memory Database collections for offline fallback
const memoryDb = {
  users: [],
  documents: [],
  chatHistories: [],
  activityLogs: []
};

const generateId = (prefix = 'id') => `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

// Seed initial users and demo documents
(async () => {
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const demoPassword = await bcrypt.hash('Demo123!', 10);

  const adminId = 'usr_admin_001';
  const demoId = 'usr_demo_002';

  memoryDb.users.push(
    {
      _id: adminId,
      id: adminId,
      name: 'System Admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      avatar: '',
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: demoId,
      id: demoId,
      name: 'Demo User',
      email: 'demo@example.com',
      password: demoPassword,
      role: 'user',
      avatar: '',
      refreshTokens: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  );

  // Seed initial demo documents for instant testing
  const doc1Id = 'doc_demo_invoice_101';
  memoryDb.documents.push(
    {
      _id: doc1Id,
      id: doc1Id,
      user: demoId,
      originalName: 'TechCorp_Invoice_2026.pdf',
      filename: 'file-demo-101.pdf',
      mimeType: 'application/pdf',
      size: 154200,
      filePath: 'uploads/demo-invoice.pdf',
      textExtracted: `INVOICE #INV-2026-9041\nDate: 2026-08-01\nSupplier: TechCorp Systems Pvt Ltd\nGSTIN: 27AAAAA0000A1Z5\nPAN: ABCDE1234F\nBill To: Acme Solutions\nEmail: billing@acmesolutions.com\nPhone: +1 (555) 234-5678\nItems:\n1. Cloud Server Instance - Qty 2 - $1,500.00\n2. Enterprise AI API License - Qty 1 - $3,350.00\nTotal Amount Due: $4,850.00`,
      ocrApplied: true,
      fileCategory: 'Invoice',
      summary: 'Invoice INV-2026-9041 from TechCorp Systems Pvt Ltd to Acme Solutions for Cloud Server Instances and Enterprise AI API License totaling $4,850.00.',
      keywords: ['Invoice', 'TechCorp', 'Cloud Server', 'GSTIN', 'Acme Solutions'],
      classification: { category: 'Invoice', confidence: 0.98, sentiment: 'Neutral' },
      extractedEntities: {
        names: ['TechCorp Systems Pvt Ltd', 'Acme Solutions'],
        emails: ['billing@acmesolutions.com'],
        phoneNumbers: ['+1 (555) 234-5678'],
        addresses: ['27AAAAA0000A1Z5 Tech Park'],
        dates: ['2026-08-01'],
        invoiceNumbers: ['INV-2026-9041'],
        gstNumbers: ['27AAAAA0000A1Z5'],
        panNumbers: ['ABCDE1234F'],
        amounts: ['$4,850.00', '$1,500.00', '$3,350.00'],
        tables: [
          {
            title: 'Line Items Table',
            headers: ['Description', 'Qty', 'Unit Price', 'Total'],
            rows: [
              ['Cloud Server Instance', '2', '$750.00', '$1,500.00'],
              ['Enterprise AI API License', '1', '$3,350.00', '$3,350.00']
            ]
          }
        ]
      },
      riskFlags: [],
      status: 'completed',
      createdAt: new Date(Date.now() - 3600000 * 24),
      updatedAt: new Date(Date.now() - 3600000 * 24)
    }
  );

  memoryDb.activityLogs.push({
    _id: 'act_demo_001',
    id: 'act_demo_001',
    user: demoId,
    action: 'DOCUMENT_UPLOAD',
    details: "Uploaded & parsed document 'TechCorp_Invoice_2026.pdf' (150.6 KB)",
    ipAddress: '127.0.0.1',
    createdAt: new Date(Date.now() - 3600000 * 24)
  });
})();

module.exports = {
  memoryDb,
  generateId
};
