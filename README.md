# FRA Claims Management System

A full-stack JavaScript application for managing Forest Rights Act (FRA) claim documents with AI-powered extraction capabilities.

## Features

- 📄 **Document Upload**: Drag-and-drop upload for PDF, JPG, JPEG, and PNG files
- 🤖 **AI Extraction**: Automatic extraction of claim details using AI model
- 🔐 **Authentication**: JWT-based authentication system
- 📊 **Dashboard**: View, filter, and manage FRA claims
- 🗄️ **Database**: PostgreSQL with NeonDB integration
- 📱 **Responsive**: Mobile-friendly interface with Tailwind CSS

## Tech Stack

### Backend
- Node.js + Express.js
- PostgreSQL (NeonDB)
- JWT Authentication
- Multer for file uploads
- bcrypt for password hashing

### Frontend
- Next.js (JavaScript)
- React Dropzone
- Axios for API calls
- Tailwind CSS
- React Toastify

## Project Structure

```
fra-claims-system/
├── backend/
│   ├── db/                 # Database connection and schema
│   ├── models/             # Data models
│   ├── controllers/        # Business logic
│   ├── routes/             # API routes
│   ├── middleware/         # Auth and error handling
│   ├── utils/              # AI model client
│   └── server.js           # Express server entry point
│
├── frontend/
│   ├── components/         # React components
│   ├── pages/              # Next.js pages
│   ├── services/           # API service layer
│   └── styles/             # Global styles
│
├── .env                    # Environment variables
└── README.md
```

## Installation

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database (NeonDB account)
- Python (if using local AI model)

### Step 1: Clone the repository

```bash
git clone <repository-url>
cd fra-claims-system
```

### Step 2: Install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Step 3: Set up the database

1. Create a NeonDB account and database
2. Run the schema SQL to create tables:

```bash
# Connect to your NeonDB and run:
psql DATABASE_URL < backend/db/schema.sql
```

### Step 4: Configure environment variables

Copy `.env.example` to `.env` and update with your values:

```bash
cp .env.example .env
```

Key variables to update:
- `DATABASE_URL`: Your NeonDB connection string
- `JWT_SECRET`: A secure random string
- `MODEL_ENDPOINT`: Your AI model endpoint (or use LOCAL)

### Step 5: Run the application

#### Development mode

```bash
# From root directory, run both backend and frontend
npm run dev

# Or run separately:
# Backend (from backend/ directory)
npm run dev

# Frontend (from frontend/ directory)
npm run dev
```

#### Production mode

```bash
# Backend
cd backend
npm start

# Frontend
cd frontend
npm run build
npm start
```

## Usage

1. **Register/Login**: Create an account or login to access features
2. **Upload Document**: Drag and drop your FRA claim form on the homepage
3. **View Dashboard**: See all uploaded documents with filters
4. **Edit Details**: Click on any document to edit extracted details
5. **Track Status**: Monitor claim status (pending, approved, rejected)

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user

### FRA Documents
- `POST /api/upload` - Upload and process document
- `GET /api/fra-docs` - Get all documents with filters
- `GET /api/fra-docs/:id` - Get specific document
- `PUT /api/fra-docs/:id` - Update document
- `DELETE /api/fra-docs/:id` - Delete document (admin only)
- `POST /api/fra-docs/:id/reprocess` - Reprocess document with AI


## AI Model Integration

The system supports two modes for AI processing:

### API Mode (Default)
Configure `MODEL_ENDPOINT` in `.env` to point to your AI model API.

### Local Mode
Set `MODEL_TYPE=LOCAL` and ensure the Python model is available at the specified path.

### Model Tech
The local AI pipeline leverages the following Python libraries:

- **EasyOCR**: Used for Optical Character Recognition (OCR) to extract text from scanned images and PDF files.
- **spaCy**: Used for advanced Natural Language Processing (NLP) tasks, such as entity extraction and text analysis from claim documents.

These tools enable robust extraction and understanding of claim data from a variety of document formats.

## Deployment

### Backend (Render/Heroku/VPS)
1. Set production environment variables
2. Ensure PostgreSQL connection is configured
3. Deploy using platform-specific instructions

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy with automatic builds

### Database (NeonDB)
Already cloud-hosted, just ensure connection string is correct.

## Security Notes

- Always use HTTPS in production
- Change default JWT_SECRET
- Implement rate limiting for API endpoints
- Sanitize file uploads
- Use environment variables for sensitive data

## Troubleshooting

### Database connection issues
- Verify DATABASE_URL is correct
- Check if SSL is required (NeonDB requires SSL)

### File upload failures
- Ensure uploads directory exists and has write permissions
- Check file size limits in multer configuration

### AI model processing errors
- Verify MODEL_ENDPOINT is accessible
- Check if model service is running
- Review model response format

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please create an issue in the GitHub repository.