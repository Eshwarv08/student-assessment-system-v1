# Student Assessment System

A modern, full-stack web application designed for assessors and students to manage, complete, and grade telecommunications cabling assessments. Built with React, TypeScript, Node.js, and MongoDB.

## 🚀 Features

### For Assessors (Dashboard)
- **Link Generation:** Generate unique assessment links for students.
- **Submission Tracking:** Real-time view of all student submissions with "Pending" and "Graded" statuses.
- **Detailed Grading Portal:** Review student answers, add comments, mark as Correct/Incorrect, and capture assessor signatures.
- **Competency Records:** Automatically generate final competency records with "Satisfactory" or "Not Satisfactory" results.
- **PDF Export:** Download professional, formatted PDFs of graded assessments including signatures and statuses.

### For Students (Assessment Form)
- **Secure Access:** Access assessments via unique tokens.
- **Digital Form:** Complete multi-part assessments including text responses, cable identification, and multiple-choice questions.
- **Digital Signatures:** Integrated signature pad for student declarations.
- **PDF Copy:** Download a personal copy of the submitted assessment as a PDF.

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Node.js, Express
- **Database:** MongoDB (via Mongoose)
- **Styling:** Tailwind CSS, Lucide React (Icons)
- **State Management:** Zustand, TanStack Query
- **Forms & Validation:** React Hook Form, Zod
- **Utilities:** Signature Pad, jsPDF

## 📦 Installation & Setup

### 1. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `backend/.env`:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `frontend/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
├── backend/              # Node.js + Express + MongoDB Backend
│   ├── models/           # Mongoose schemas
│   ├── index.js          # Server entry point
│   └── .env              # Backend environment variables
├── frontend/             # React + Vite Frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── lib/          # API client and utilities
│   │   ├── pages/        # Main application pages
│   │   ├── store/        # Zustand state stores
│   │   └── types/        # TypeScript definitions
│   └── .env              # Frontend environment variables
└── backups/              # Archived migration scripts and obsolete files
```

## 📄 License

ISC License. See `package.json` for details. 
 
## 📝 Notes

- For Question 1 - ICTCBL246 & ICTCBL247 
- For Question 2 - ICTCBL330
- For Question 3 - ICTCBL322
- For Question 4 - ICTCBL320
- For Question 5 - ICTTEN254
- For Question 6 - ICTCBL208
- For Question 7 - ICTCBL333
- For Question 8 - ICTICT308
- For Question 9 - ICTTEN307
- For Question 10 - ICTCBL204

