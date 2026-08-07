-- ====================================================================
-- INTELLIGENT DOCUMENT PROCESSING (IDP) PLATFORM
-- SUPABASE POSTGRESQL FULL DATABASE SCHEMA & SEED QUERIES
-- ====================================================================
-- Instructions: Copy and run this entire SQL script inside your
-- Supabase SQL Editor (https://app.supabase.com/project/_/sql)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for Fast User Login Lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- 3. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id VARCHAR(64) REFERENCES public.users(id) ON DELETE CASCADE,
  original_name VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes BIGINT NOT NULL,
  file_path TEXT NOT NULL,
  text_extracted TEXT,
  ocr_applied BOOLEAN DEFAULT FALSE,
  file_category VARCHAR(100) DEFAULT 'General',
  summary TEXT,
  keywords TEXT[],
  classification JSONB DEFAULT '{"category": "General", "confidence": 0.9, "sentiment": "Neutral"}'::jsonb,
  extracted_entities JSONB DEFAULT '{"names": [], "emails": [], "phoneNumbers": [], "addresses": [], "dates": [], "invoiceNumbers": [], "gstNumbers": [], "panNumbers": [], "amounts": [], "tables": []}'::jsonb,
  risk_flags JSONB DEFAULT '[]'::jsonb,
  status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Fast Document Search & Filter Queries
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents (user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents (file_category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents (status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents (created_at DESC);

-- 4. CHAT HISTORIES TABLE
CREATE TABLE IF NOT EXISTS public.chat_histories (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id VARCHAR(64) REFERENCES public.users(id) ON DELETE CASCADE,
  document_id VARCHAR(64) REFERENCES public.documents(id) ON DELETE CASCADE,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for Fast Chat Lookup
CREATE INDEX IF NOT EXISTS idx_chat_histories_doc ON public.chat_histories (document_id);

-- 5. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id VARCHAR(64) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  user_id VARCHAR(64) REFERENCES public.users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for Audit Log Searches
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs (created_at DESC);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_histories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Allow Public Access Policy for Service Role & Application Backend
CREATE POLICY "Allow All Access to Users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow All Access to Documents" ON public.documents FOR ALL USING (true);
CREATE POLICY "Allow All Access to Chat Histories" ON public.chat_histories FOR ALL USING (true);
CREATE POLICY "Allow All Access to Activity Logs" ON public.activity_logs FOR ALL USING (true);

-- ====================================================================
-- SEED DATA INSERTION QUERIES (RUN IN SUPABASE SQL EDITOR)
-- ====================================================================

-- Seed Default Admin User
INSERT INTO public.users (id, name, email, role, created_at)
VALUES (
  'usr_admin_001',
  'Platform Admin',
  'admin@example.com',
  'admin',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Seed Default Regular User
INSERT INTO public.users (id, name, email, role, created_at)
VALUES (
  'usr_demo_002',
  'Akhil Demo User',
  'demo@example.com',
  'user',
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Seed Sample Invoice Document
INSERT INTO public.documents (
  id,
  user_id,
  original_name,
  filename,
  mime_type,
  size_bytes,
  file_path,
  text_extracted,
  ocr_applied,
  file_category,
  summary,
  keywords,
  classification,
  extracted_entities,
  risk_flags,
  status,
  created_at
) VALUES (
  'doc_demo_invoice_101',
  'usr_demo_002',
  'TechCorp_Invoice_2026.pdf',
  'sample_techcorp_invoice.pdf',
  'application/pdf',
  153600,
  'backend/uploads/sample_techcorp_invoice.pdf',
  'INVOICE #INV-2026-0042\nDate: 2026-08-01\nVendor: TechCorp Global Solutions LLC\nBill To: Gatla Enterprises Pvt Ltd\nEmail: billing@techcorp.com\nPhone: +1 800 555 0199\nAddress: 100 Innovation Way, San Jose, CA\nGSTIN: 27AAACT1234A1Z5\nPAN: ABCDE1234F\nItems:\n1. AI Cloud Processing Server Instance (Monthly) - Qty 2 - $1,200.00\n2. Document OCR Engine License - Qty 1 - $3,500.00\nTotal Due: $5,900.00\nNotice: Payment due within 15 days.',
  true,
  'Invoice',
  'Commercial invoice #INV-2026-0042 issued by TechCorp Global Solutions LLC to Gatla Enterprises Pvt Ltd for AI Cloud Processing and OCR Licenses. Total invoice amount due is $5,900.00.',
  ARRAY['Invoice', 'TechCorp', 'Cloud', 'OCR', 'Payment'],
  '{"category": "Invoice", "confidence": 0.98, "sentiment": "Neutral"}'::jsonb,
  '{
    "names": ["TechCorp Global Solutions LLC", "Gatla Enterprises Pvt Ltd"],
    "emails": ["billing@techcorp.com"],
    "phoneNumbers": ["+1 800 555 0199"],
    "addresses": ["100 Innovation Way, San Jose, CA"],
    "dates": ["2026-08-01"],
    "invoiceNumbers": ["INV-2026-0042"],
    "gstNumbers": ["27AAACT1234A1Z5"],
    "panNumbers": ["ABCDE1234F"],
    "amounts": ["$5,900.00", "$1,200.00", "$3,500.00"],
    "tables": [
      {
        "title": "Extracted Invoice Line Items",
        "headers": ["Description", "Quantity", "Price", "Subtotal"],
        "rows": [
          ["AI Cloud Processing Server Instance", "2", "$1,200.00", "$2,400.00"],
          ["Document OCR Engine License", "1", "$3,500.00", "$3,500.00"]
        ]
      }
    ]
  }'::jsonb,
  '[{"severity": "Low", "issue": "Standard Payment Terms", "description": "Invoice payment terms set to 15 days."}]'::jsonb,
  'completed',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Seed Sample Activity Log
INSERT INTO public.activity_logs (id, user_id, action, details, ip_address, created_at)
VALUES (
  'act_seed_001',
  'usr_demo_002',
  'DOCUMENT_UPLOAD',
  'Uploaded & processed TechCorp_Invoice_2026.pdf (150 KB)',
  '127.0.0.1',
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- USEFUL ANALYTICAL QUERIES FOR SUPABASE SQL EDITOR
-- ====================================================================

-- Query 1: Total Processed Documents & Storage
SELECT 
  COUNT(id) AS total_documents,
  ROUND(SUM(size_bytes) / (1024.0 * 1024.0), 2) AS total_storage_mb,
  COUNT(CASE WHEN ocr_applied THEN 1 END) AS ocr_count
FROM public.documents;

-- Query 2: Document Breakdown by Category
SELECT 
  file_category, 
  COUNT(*) AS doc_count 
FROM public.documents 
GROUP BY file_category 
ORDER BY doc_count DESC;

-- Query 3: Recent Activity Logs
SELECT 
  a.action, 
  u.name AS user_name, 
  a.details, 
  a.created_at 
FROM public.activity_logs a
JOIN public.users u ON a.user_id = u.id
ORDER BY a.created_at DESC 
LIMIT 10;
