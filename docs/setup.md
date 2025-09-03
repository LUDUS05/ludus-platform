# LUDUS Platform - Setup and Deployment Guide

This guide provides comprehensive instructions for setting up the LUDUS platform for development and deploying it to production.

## 1. Development Environment Setup

### 1.1. Prerequisites
- Node.js (v18 or higher)
- npm
- MongoDB Atlas account
- Git

### 1.2. Clone the Repository
```bash
git clone https://github.com/LUDUS05/ludus-platform.git
cd ludus-platform
```

### 1.3. Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install

# Install server dependencies
cd ../server
npm install
```

### 1.4. Environment Variables
You will need to create `.env` files for both the `client` and `server` directories.

#### 1.4.1. Server Environment (`server/.env`)
Create a file named `.env` in the `server` directory and add the following variables.

**For local development with a production database:**
```env
NODE_ENV=production
PORT=5001
MONGODB_URI=mongodb+srv://lds:Mm0916777655@ludus-mvp.kdxn9gc.mongodb.net/ludus_production?retryWrites=true&w=majority&appName=ludus-mvp
JWT_SECRET=ludus-super-secret-jwt-key-development-2024
JWT_REFRESH_SECRET=ludus-super-secret-refresh-jwt-key-development-2024
```

**For a full local setup, you will also need:**
```env
# Moyasar Payment Gateway
MOYASAR_PUBLISHABLE_KEY=pk_test_your_moyasar_publishable_key
MOYASAR_SECRET_KEY=sk_test_your_moyasar_secret_key

# Email Service (Google Workspace SMTP)
SMTP_HOST=smtp-relay.gmail.com
SMTP_USER=your-email@example.com
SMTP_PASS=your-smtp-password
```

#### 1.4.2. Client Environment (`client/.env.local`)
Create a file named `.env.local` in the `client` directory and add the following:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

### 1.5. Running the Application
```bash
# Start the backend server (from the root directory)
cd server
npm run dev

# Start the frontend development server (from the root directory)
cd client
npm start
```

## 2. Deployment

This project is designed to be deployed with a split front-end/back-end architecture. The recommended setup is:
- **Backend**: Railway or Render
- **Frontend**: Vercel or Render

### 2.1. Backend Deployment (Railway)

1. **Sign up at [Railway.app](https://railway.app)** and connect your GitHub repository.
2. **Set Environment Variables** in the Railway dashboard (see section 1.4.1 for the list of variables).
3. **Configure Build Command**: `cd server && npm install`
4. **Configure Start Command**: `cd server && npm start`

### 2.2. Frontend Deployment (Vercel)

1. **Sign up at [Vercel.com](https://vercel.com)** and connect your GitHub repository.
2. **Configure Build Settings**:
   - **Framework Preset**: Create React App
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
3. **Set Environment Variables** in Vercel:
   ```env
   REACT_APP_API_URL=https://your-backend.railway.app/api
   REACT_APP_MOYASAR_PUBLISHABLE_KEY=pk_live_your_moyasar_live_publishable_key
   ```

### 2.3. Alternative: Full-Stack Deployment on Render

You can deploy both the front-end and back-end on Render.

#### 2.3.1. Backend on Render
1. **New Web Service** in Render.
2. **Root Directory**: (leave empty)
3. **Build Command**: `cd server && npm install`
4. **Start Command**: `cd server && npm start`
5. **Set Environment Variables** (see section 1.4.1).

#### 2.3.2. Frontend on Render
1. **New Static Site** in Render.
2. **Build Command**: `cd client && npm install && npm run build`
3. **Publish Directory**: `client/build`
4. **Set Environment Variables**:
   ```env
   REACT_APP_API_URL=https://your-render-backend-url/api
   ```

## 3. Service Configuration

### 3.1. MongoDB Atlas
1. **Create a MongoDB Atlas account** and a new cluster.
2. **Create a database user** and get the connection string.
3. **Whitelist IP addresses** for your deployment environment (0.0.0.0/0 for production).

### 3.2. Moyasar Payment Gateway
1. **Sign up at [Moyasar.com](https://moyasar.com)**.
2. **Get your live API keys** (publishable and secret).
3. **Set up webhooks** in the Moyasar dashboard:
   - **URL**: `https://your-backend-domain/api/payments/webhook`
   - **Events**: `payment.paid`, `payment.failed`, `payment.expired`, `payment.refunded`

### 3.3. Google Workspace SMTP Relay

For the e-mail service to work, you need to configure SMTP relay in your Google Workspace account.

1. **Enable 2-Step Verification** for your Google account.
2. **Generate an App Password**. This will be your `SMTP_PASS`.
3. **Configure SMTP Relay in Google Admin Console**:
   - Go to **Apps > Google Workspace > Gmail > Routing**.
   - **Allowed senders**: "Only addresses in my domains".
   - **Authentication**: "Require SMTP authentication".
   - **Encryption**: "Require TLS encryption".

## 4. Post-Deployment

### 4.1. Database Seeding
To populate your database with initial data, run the following command (make sure your server is connected to the correct database):
```bash
npm run seed
```

### 4.2. Admin User
The seeding process creates a default admin user.
- **Email**: `admin@ludusapp.com`
- **Password**: (set via the `ADMIN_PASSWORD` environment variable)
