# Intelligent Document Processing AI Platform 🚀

A production-ready, full-stack Intelligent Document Processing (IDP) platform built with Node.js, Express, MongoDB, Google Gemini AI, Tesseract OCR, and Vite React with Tailwind CSS.

---

## 🌟 Key Features

- 📄 **Multi-Format Processing**: Parse scanned PDF documents (`pdf-parse`), Microsoft Word files (`mammoth`), and image formats (`sharp` + `tesseract.js`).
- 👁️ **Optical Character Recognition (OCR)**: Automatic Sharp image preprocessing & Tesseract vision fallback for scanned files.
- 🧠 **Google Gemini 1.5 AI Pipeline**:
  - **Entity Extraction**: Names, Emails, Phone Numbers, Physical Addresses, Dates, Invoice Numbers, GSTIN, PAN, and Amounts.
  - **Table Parsing**: Automatic extraction of tabular structures into formatted interactive grid components.
  - **Executive Summarization**: AI-generated document summaries & keyword extraction.
  - **Risk & Compliance Detection**: Spotting missing fields, financial discrepancies, and high-risk terms.
  - **Document Classification**: Automatic categorizing (Invoice, Receipt, Contract, Tax, Identity ID, Report).
- 💬 **Conversational AI Q&A**: Contextual multi-turn chat backed by RAG document retrieval using Gemini AI.
- 🔍 **Global Multi-Criteria Search**: Instant search by keyword, entity name, GST, PAN, invoice number, category, or date range.
- 📊 **Telemetry Analytics Dashboard**: Interactive Recharts graphs tracking upload velocity, category breakdown, storage occupancy, and real-time activity streams.
- 🔐 **Enterprise Security & Auth**: JWT access tokens, refresh tokens, bcrypt password hashing, Zod schema validation, Helmet security headers, CORS protection, rate limiting, and Activity Log audit trail.
- 🎨 **Modern Dark Mode UI**: Built with React, Vite, Tailwind CSS, Lucide icons, glassmorphism aesthetics, and toast notifications.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18, Vite, React Router DOM
- **Styling**: Tailwind CSS, Glassmorphism design tokens
- **Data Visualization**: Recharts
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form
- **Toasts**: React Hot Toast

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB & Mongoose ORM
- **Authentication**: JWT Access & Refresh Tokens, bcryptjs
- **Validation**: Zod Schemas
- **Security & Utilities**: Helmet, CORS, Morgan, Express-Rate-Limit

### AI, OCR & File Parsing
- **AI Model**: Google Gemini API (`@google/generative-ai`)
- **OCR Engine**: Tesseract.js
- **Image Processing**: Sharp
- **PDF Extraction**: pdf-parse
- **DOCX Extraction**: mammoth

---

## 📁 Directory Structure

```
.
├── backend/
│   ├── config/             # MongoDB database connection
│   ├── controllers/        # Auth, Document, Chat, Search, Analytics, Admin logic
│   ├── middlewares/        # Auth JWT, Admin check, Multer upload, Error handling
│   ├── models/             # User, Document, ChatHistory, ActivityLog Mongoose Schemas
│   ├── routes/             # Express API route modules
│   ├── services/           # OCR service, Parser service, Gemini AI service
│   ├── utils/              # Logger stream & standardized API response formatters
│   ├── validators/         # Zod request validation schemas
│   ├── uploads/            # Sanitized physical document storage
│   ├── logs/               # Application system audit logs
│   ├── app.js              # Express app configuration & middlewares
│   ├── server.js           # Server listener & database bootstrap
│   ├── .env.example        # Environment variables blueprint
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/     # Navbar, Sidebar, Footer, EntityCard, LoadingSkeleton, ConfirmationModal
│   │   ├── context/        # AuthContext, ThemeContext
│   │   ├── pages/          # 13 Application Pages (Landing, Register, Login, Dashboard, Upload, Details, Chat, Search, History, Profile, Admin, Settings, 404)
│   │   ├── services/       # Axios API client with automatic token refresh
│   │   ├── App.jsx         # Router & Auth Protected route tree
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Tailwind CSS & glassmorphism utilities
│   ├── vite.config.js      # Proxy setup to backend API
│   ├── tailwind.config.js
│   └── package.json
├── docs/
│   └── api-collection.json # Postman API Test Collection
├── package.json            # Root workspace orchestrator
└── README.md
```

---

## 🚦 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- MongoDB running locally (`mongodb://127.0.0.1:27017/idp_platform`) or a MongoDB Atlas URI string.
- Google Gemini API Key (Optional: system includes fallback heuristic engines if key is omitted).

---

### Step 1: Install Dependencies

Run the following command from the root directory:

```bash
npm run install:all
```

---

### Step 2: Configure Environment Variables

Create a `.env` file inside the `backend/` directory by copying `.env.example`:

```bash
cd backend
cp .env.example .env
```

Set your secrets in `backend/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/idp_platform
JWT_SECRET=super_secret_jwt_access_key_2026
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_2026
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_URL=http://localhost:5173
```

---

### Step 3: Run the Application

Start both the Backend API server and Frontend Vite development server concurrently from the root directory:

```bash
npm run dev
```

- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 📡 Production Deployment

### Backend -> Render
1. Push project to GitHub repository.
2. Create a new **Web Service** on [Render](https://render.com).
3. Set root directory to `backend`.
4. Build Command: `npm install`
5. Start Command: `node server.js`
6. Add environment variables (`MONGODB_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.).

### Frontend -> Vercel
1. Create a new project on [Vercel](https://vercel.com).
2. Set root directory to `frontend`.
3. Framework Preset: `Vite`.
4. Build Command: `npm run build`
5. Output Directory: `dist`.

---

## 📄 License

Distributed under the MIT License. Enterprise production ready.
