# Store Rating Application

A full-stack store rating application built with React, Express.js, and PostgreSQL.

## Features

- User authentication and authorization (Normal User, Store Owner, Admin)
- Store discovery and search functionality
- Rating and review system
- Store owner dashboard
- Admin management interface
- Responsive design

## Tech Stack

### Frontend
- React 18
- React Router
- Axios for API calls
- React Hook Form for form handling
- Yup for validation

### Backend
- Express.js
- PostgreSQL with pg
- JWT authentication
- Joi validation
- bcryptjs for password hashing

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd store-rating-app
```

2. Install dependencies for all packages
```bash
npm run install:all
```

3. Set up environment variables
```bash
# Copy example environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Edit the files with your configuration
```

4. Set up the database
```bash
# Create PostgreSQL databases
createdb store_rating_dev
createdb store_rating_test
```

5. Start the development servers
```bash
npm run dev
```

This will start both the backend server (http://localhost:5000) and frontend development server (http://localhost:3000).

## Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run install:all` - Install dependencies for all packages
- `npm test` - Run tests for both frontend and backend

### Backend
- `npm run server:dev` - Start backend in development mode
- `npm run server:start` - Start backend in production mode
- `npm run server:test` - Run backend tests

### Frontend
- `npm run client:dev` - Start frontend development server
- `npm run client:build` - Build frontend for production
- `npm run client:test` - Run frontend tests

## Project Structure

```
store-rating-app/
├── backend/                 # Express.js API server
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Custom middleware
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── config/             # Configuration files
│   ├── utils/              # Utility functions
│   ├── tests/              # Backend tests
│   └── server.js           # Server entry point
├── frontend/               # React application
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   └── package.json
└── package.json            # Root package.json
```

## Environment Variables

### Backend (.env)
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production/test)
- `DB_*` - Database configuration
- `JWT_*` - JWT token configuration
- `EMAIL_*` - Email service configuration

### Frontend (.env)
- `REACT_APP_API_URL` - Backend API URL
- `REACT_APP_APP_NAME` - Application name

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.