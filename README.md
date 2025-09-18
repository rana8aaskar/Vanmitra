# 🌳 Vanmitra - Forest Rights Act Claims Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-blue.svg)](https://postgresql.org/)

A comprehensive full-stack application for managing Forest Rights Act (FRA) claims with AI-powered document processing, interactive mapping, and intelligent decision support systems.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Machine Learning Components](#machine-learning-components)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Vanmitra is a modern web application designed to streamline the management of Forest Rights Act (FRA) claims in India. The system combines traditional document processing with cutting-edge AI technology to provide:

- **Automated Document Processing**: AI-powered extraction of claim details from uploaded documents
- **Interactive Mapping**: Real-time visualization of forest resources and claim locations
- **Decision Support System (DSS)**: ML-powered recommendations for claim assessments
- **Comprehensive Dashboard**: Complete claim lifecycle management

## ✨ Features

### 🔐 Authentication & User Management
- JWT-based secure authentication
- Role-based access control
- User profile management
- Session management with persistent login

### 📄 Document Processing
- **Multi-format Support**: PDF, JPG, JPEG, PNG
- **Drag-and-Drop Upload**: Intuitive file upload interface
- **AI-Powered Extraction**: Automatic extraction of:
  - Claimant details (name, age, gender, category)
  - Land information (area, coordinates, boundaries)
  - Financial details (annual income, tax status)
  - Administrative data (village, tehsil, district, state)

### 🗺️ Interactive Mapping
- **Real-time Visualization**: Dynamic map with claim markers
- **Asset Classification**: Color-coded markers for different land types:
  - 🟦 Water Bodies
  - 🟢 Forest Areas
  - 🟡 Agriculture Land
  - 🔴 Built-up Areas
- **Advanced Filtering**: Filter by claim status and asset type
- **Detailed Popups**: Rich information display on marker click

### 📊 Analytics Dashboard
- **Claim Statistics**: Real-time metrics and KPIs
- **Status Tracking**: Progress monitoring for each claim
- **Export Capabilities**: PDF and CSV report generation
- **Visual Analytics**: Charts and graphs for data insights

### 🤖 Decision Support System (DSS)
- **ML-Powered Recommendations**: Intelligent claim assessment
- **Risk Analysis**: Automated risk scoring
- **Data-Driven Insights**: Historical pattern analysis
- **Predictive Modeling**: Outcome prediction based on claim attributes

### 🎨 User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Smooth Animations**: Framer Motion powered interactions
- **Modern UI**: Clean, intuitive interface design
- **Accessibility**: WCAG compliant design patterns

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (React 18)
- **Styling**: Tailwind CSS with custom components
- **Animations**: Framer Motion
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **UI Components**: Lucide React icons
- **File Handling**: React Dropzone
- **Notifications**: React Toastify
- **PDF Generation**: jsPDF with html2canvas

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL with NeonDB
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Password Hashing**: bcrypt
- **Database ORM**: Native PostgreSQL with pg
- **Environment Management**: dotenv
- **Process Management**: nodemon (development)

### Machine Learning & Data Processing
- **ML Framework**: Python with scikit-learn
- **Data Processing**: pandas, geopandas
- **Geospatial Analysis**: Shapely
- **Model Serialization**: joblib
- **Database Integration**: SQLAlchemy
- **Environment**: Python virtual environment

### DevOps & Tools
- **Version Control**: Git
- **Package Management**: npm
- **Process Management**: concurrently
- **Linting**: ESLint
- **Code Formatting**: Prettier (via ESLint)

## 📁 Project Structure

```
Vanmitra/
├── 📁 backend/                 # Node.js Express API
│   ├── 📁 controllers/         # Business logic controllers
│   │   ├── authController.js   # Authentication logic
│   │   └── fraController.js    # FRA claims logic
│   ├── 📁 db/                  # Database configuration
│   │   ├── schema.sql          # Database schema
│   │   ├── index.js           # Database connection
│   │   └── init-db.js         # Database initialization
│   ├── 📁 middleware/          # Express middleware
│   │   ├── authMiddleware.js   # JWT authentication
│   │   └── errorHandler.js    # Error handling
│   ├── 📁 models/              # Data models
│   │   ├── userModel.js       # User data model
│   │   └── fraModel.js        # FRA claims model
│   ├── 📁 routes/              # API routes
│   │   ├── userRoutes.js      # User management routes
│   │   ├── fraRoutes.js       # FRA claims routes
│   │   ├── claimRoutes.js     # Claim processing routes
│   │   └── dssRoutes.js       # DSS API routes
│   ├── 📁 services/            # Business services
│   │   ├── dssService.js      # Decision support service
│   │   └── dssEngineService.js # ML engine integration
│   ├── 📁 utils/               # Utility functions
│   │   ├── modelClient.js     # AI model client
│   │   └── pipelineProcessor.js # Data processing
│   ├── .env.example           # Environment variables template
│   ├── package.json           # Dependencies and scripts
│   └── server.js              # Express server entry point
│
├── 📁 frontend/                # Next.js React application
│   ├── 📁 components/          # Reusable React components
│   │   ├── Navbar.jsx         # Navigation component
│   │   ├── FileUpload.jsx     # File upload component
│   │   ├── DocumentCard.jsx   # Document display component
│   │   ├── DSSRecommendations.jsx # DSS results component
│   │   ├── FullDetailsModal.jsx # Detailed view modal
│   │   └── CustomToast.jsx    # Toast notifications
│   ├── 📁 pages/               # Next.js pages
│   │   ├── index.jsx          # Landing page
│   │   ├── dashboard.jsx      # Main dashboard
│   │   ├── upload.jsx         # Document upload page
│   │   ├── fra-act.jsx        # FRA information page
│   │   └── impact.jsx         # Impact visualization
│   ├── 📁 services/            # API service layer
│   │   └── api.js             # API client configuration
│   ├── 📁 styles/              # Styling files
│   │   └── globals.css        # Global CSS styles
│   ├── 📁 utils/               # Frontend utilities
│   │   └── generateReport.js  # Report generation
│   ├── 📁 public/              # Static assets
│   │   ├── 📁 images/          # Images and logos
│   │   ├── 📁 emblems/         # Government emblems
│   │   ├── favicon.svg        # Site favicon
│   │   └── map-wrapper.html   # Interactive map container
│   ├── next.config.js         # Next.js configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── package.json           # Dependencies and scripts
│
├── 📁 DSS/                     # Decision Support System
│   ├── DSS.py                 # Main DSS engine
│   ├── predictor.py           # ML prediction service
│   ├── dss_model.joblib       # Trained ML model
│   ├── dss_village_stats.csv  # Village statistics data
│   ├── dss_definitive_master_db_new.csv # Master database
│   └── 📁 geojson files/       # Geospatial data files
│
├── 📁 Faker/                   # Data generation utilities
│   ├── final.py               # Final data processing
│   ├── new.py                 # Data generation scripts
│   └── 📁 pipeline/            # ML pipeline components
│       ├── pipeline.py        # Main pipeline
│       ├── process_image.py   # Image processing
│       ├── generate_test_csv.py # Test data generation
│       └── requirements.txt   # Python dependencies
│
├── 📁 shared/                  # Shared utilities and types
├── .env                       # Environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Root package configuration
└── README.md                  # Project documentation
```

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (version 18 or higher) - [Download](https://nodejs.org/)
- **Python** (version 3.8 or higher) - [Download](https://python.org/)
- **PostgreSQL** (version 13 or higher) - [Download](https://postgresql.org/)
- **Git** - [Download](https://git-scm.com/)
- **npm** or **yarn** package manager

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/vanmitra.git
cd vanmitra
```

### 2. Install Dependencies

```bash
# Install all dependencies (root, backend, and frontend)
npm run install-all

# Or install individually:
npm install                    # Root dependencies
cd backend && npm install      # Backend dependencies
cd ../frontend && npm install  # Frontend dependencies
```

### 3. Python Environment Setup

```bash
# Create virtual environment for Python components
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
cd Faker/pipeline
pip install -r requirements.txt
```

## ⚙️ Configuration

### 1. Environment Variables

Create `.env` files in the appropriate directories:

#### Root `.env`:
```env
NODE_ENV=development
```

#### Backend `.env.example` → `.env`:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/vanmitra
NEON_DATABASE_URL=your_neon_database_url

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5000
NODE_ENV=development

# AI Service Configuration
AI_SERVICE_URL=http://localhost:8000
AI_API_KEY=your_ai_api_key

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

#### Frontend `.env.example` → `.env.local`:
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Feature Flags
NEXT_PUBLIC_ENABLE_DSS=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
```

#### DSS `.env`:
```env
# Database Configuration (same as backend)
DATABASE_URL=postgresql://username:password@localhost:5432/vanmitra

# Model Configuration
MODEL_PATH=./dss_model.joblib
GEOJSON_PATH=./
```

### 2. Database Setup

```bash
# Initialize the database
cd backend
npm run db:init

# Reset database (if needed)
npm run db:reset
```

### 3. Import Sample Data (Optional)

```bash
# Import DSS data
cd backend
npm run import-dss
```

## 🎮 Usage

### Development Mode

Start all services in development mode:

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run frontend    # Frontend only (http://localhost:3000)
npm run backend     # Backend only (http://localhost:5000)
```

### Production Mode

```bash
# Build frontend
cd frontend
npm run build
npm start

# Start backend
cd backend
npm start
```

### Python Services

```bash
# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run DSS engine
cd DSS
python DSS.py

# Run data pipeline
cd Faker/pipeline
python pipeline.py
```

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/login`
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

### Claims Endpoints

#### GET `/api/claims`
Retrieve all claims for the authenticated user.

**Headers:**
```
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "claims": [
    {
      "id": 1,
      "claimant_name": "Ram Kumar",
      "village": "Bhilpur",
      "status": "pending",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### POST `/api/claims/upload`
Upload and process a new claim document.

**Headers:**
```
Authorization: Bearer jwt_token_here
Content-Type: multipart/form-data
```

**Form Data:**
```
file: [PDF/Image file]
```

### DSS Endpoints

#### GET `/api/dss/recommendations/:claimId`
Get DSS recommendations for a specific claim.

**Response:**
```json
{
  "success": true,
  "recommendations": {
    "risk_score": 0.25,
    "approval_probability": 0.78,
    "similar_cases": 15,
    "recommendations": [
      "Verify boundary descriptions",
      "Check water body proximity"
    ]
  }
}
```

## 🤖 Machine Learning Components

### Decision Support System (DSS)

The DSS engine uses machine learning to provide intelligent recommendations:

#### Features Used:
- **Demographic Data**: Age, gender, category, annual income
- **Geographic Data**: State, district, village coordinates
- **Land Data**: Area claimed, land use type, water body proximity
- **Administrative Data**: Submission date, verification status

#### Model Architecture:
- **Algorithm**: Random Forest Classifier
- **Training Data**: Historical FRA claims with outcomes
- **Features**: 15+ engineered features
- **Accuracy**: ~85% on validation set

#### Usage:
```python
from DSS.predictor import DSSPredictor

predictor = DSSPredictor()
recommendation = predictor.predict({
    'claimant_age': 45,
    'annual_income': 25000,
    'land_area': 2.5,
    'village_code': 'MH001234'
})
```

### Data Pipeline

The ML pipeline processes raw data through several stages:

1. **Data Extraction**: PDF/Image text extraction
2. **Data Cleaning**: Standardization and validation
3. **Feature Engineering**: Derived features creation
4. **Model Inference**: Prediction and scoring
5. **Result Generation**: Formatted recommendations

## 🎨 UI Components

### Key Components

#### `Navbar.jsx`
Navigation component with authentication state management.

#### `FileUpload.jsx`
Drag-and-drop file upload with progress tracking.

#### `DocumentCard.jsx`
Display component for processed documents.

#### `DSSRecommendations.jsx`
ML recommendations display with visual indicators.

### Styling Guidelines

- **Color Palette**:
  - Primary: Forest Green (`#16a34a`)
  - Secondary: Water Blue (`#0ea5e9`)
  - Accent: Earth Brown (`#a3a3a3`)
- **Typography**: Playfair Display for headings, system fonts for body
- **Spacing**: 4px base unit following Tailwind spacing scale
- **Animations**: Subtle transitions using Framer Motion

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test
```

### Backend Testing
```bash
cd backend
npm run test
```

### API Testing
Use the provided Postman collection or curl commands:

```bash
# Test authentication
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

## 🚀 Deployment

### Docker Deployment (Recommended)

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Manual Deployment

#### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy build folder to your hosting service
```

#### Backend (Heroku/Railway)
```bash
cd backend
# Set environment variables in your hosting service
# Deploy using git or CLI tools
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Your Changes**
4. **Add Tests** (if applicable)
5. **Commit Your Changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
6. **Push to the Branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

### Code Style Guidelines

- **JavaScript**: Follow ESLint configuration
- **Python**: Follow PEP 8 standards
- **Commits**: Use conventional commit messages
- **Documentation**: Update README for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ministry of Tribal Affairs, Government of India** for FRA guidelines
- **Open Source Community** for the amazing tools and libraries
- **Contributors** who help make this project better

## 📞 Support

For support and questions:

- **Email**: support@vanmitra.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/vanmitra/issues)
- **Documentation**: [Wiki](https://github.com/yourusername/vanmitra/wiki)

---

**Made with ❤️ for Forest Rights and Digital India**

*Last updated: September 2024*